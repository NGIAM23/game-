-- Fuseau horaire par utilisateur (corrige le décalage UTC vs heure locale sur
-- le bonus du dimanche et les périodes de quêtes) + durcissement anti-spoofing
-- GPS sur les duels. À exécuter après 17_battle_pass.sql.

alter table profiles add column if not exists user_timezone text not null default 'Europe/Paris';

create or replace function current_user_local_date()
returns date as $$
declare
  v_tz text;
begin
  select coalesce(user_timezone, 'Europe/Paris') into v_tz from profiles where id = auth.uid();
  if v_tz is null then
    v_tz := 'Europe/Paris';
  end if;
  return (now() at time zone v_tz)::date;
exception when others then
  -- Fuseau invalide fourni par le client : on retombe sur Europe/Paris plutôt que d'échouer.
  return (now() at time zone 'Europe/Paris')::date;
end;
$$ language plpgsql stable;

-- ===== Bonus du dimanche + streak : remplace la dernière version de complete_task
-- (celle de 11_streak_freeze.sql) pour utiliser la date locale de l'utilisateur
-- au lieu de current_date (UTC serveur).
create or replace function complete_task(p_task_id text, p_verified boolean default false)
returns integer as $$
declare
  v_base_xp integer;
  v_category text;
  v_frequency text;
  v_xp integer;
  v_sparks integer;
  v_last_completed date;
  v_is_plus boolean;
  v_period date;
  v_boost_until timestamptz;
  v_freezes integer;
  v_today date;
  v_multiplier numeric := 1;
begin
  select base_xp, category, frequency into v_base_xp, v_category, v_frequency from tasks where id = p_task_id;
  if v_base_xp is null then
    raise exception 'Unknown task %', p_task_id;
  end if;

  v_today := current_user_local_date();
  v_xp := case when v_category = 'detoxEcran' then v_base_xp * 3 else v_base_xp end;

  if extract(dow from v_today) = 0 then
    v_multiplier := v_multiplier * 2;
  end if;

  select is_plus, xp_boost_until into v_is_plus, v_boost_until from profiles where id = auth.uid();
  if v_is_plus then
    v_multiplier := v_multiplier * 1.1;
  end if;

  if v_boost_until is not null and v_boost_until > now() then
    v_multiplier := v_multiplier * 2;
  end if;

  if p_verified then
    v_multiplier := v_multiplier * 1.15;
  end if;

  v_xp := round(v_xp * v_multiplier)::integer;
  v_sparks := greatest(1, round(v_xp / 5.0)::integer);
  v_period := case when v_frequency = 'weekly' then date_trunc('week', v_today)::date else v_today end;

  insert into task_completions (user_id, task_id, xp_awarded, completed_on, verified)
  values (auth.uid(), p_task_id, v_xp, v_period, p_verified);

  select last_completed_on, streak_freezes into v_last_completed, v_freezes from profiles where id = auth.uid();

  update profiles
  set
    total_xp = total_xp + v_xp,
    sparks = sparks + v_sparks,
    current_streak = case
      when v_last_completed = v_today then current_streak
      when v_last_completed = v_today - 1 then current_streak + 1
      when v_last_completed = v_today - 2 and v_freezes > 0 then current_streak + 1
      else 1
    end,
    streak_freezes = case
      when v_last_completed = v_today - 2 and v_freezes > 0 then v_freezes - 1
      else v_freezes
    end,
    last_completed_on = v_today
  where id = auth.uid();

  return v_xp;
end;
$$ language plpgsql security definer;

-- ===== Classement de la Course du Dimanche, en heure locale plutôt qu'UTC.
create or replace function sunday_leaderboard()
returns table (pseudo text, avatar_seed text, sunday_xp bigint)
language plpgsql
security definer
as $$
declare
  v_today date := current_user_local_date();
begin
  if extract(dow from v_today) <> 0 then
    return;
  end if;

  return query
  select p.pseudo, p.avatar_seed, sum(tc.xp_awarded) as sunday_xp
  from task_completions tc
  join profiles p on p.id = tc.user_id
  where tc.completed_on = v_today
    and p.pseudo is not null
  group by p.pseudo, p.avatar_seed
  order by sunday_xp desc
  limit 10;
end;
$$;

-- ===== Périodes de quêtes en heure locale plutôt qu'UTC.
create or replace function quest_period_start(p_scope text)
returns date as $$
declare
  v_today date := current_user_local_date();
begin
  return case when p_scope = 'weekly' then date_trunc('week', v_today)::date else date_trunc('month', v_today)::date end;
end;
$$ language plpgsql stable;

-- ===== Calendrier de streak en heure locale plutôt qu'UTC.
create or replace function get_streak_calendar()
returns table(day date, completed boolean) as $$
declare
  v_today date := current_user_local_date();
begin
  return query
  select d::date, exists(
    select 1 from task_completions tc
    where tc.user_id = auth.uid() and tc.completed_on = d::date
  )
  from generate_series(v_today - 34, v_today, interval '1 day') as d;
end;
$$ language plpgsql security definer;

-- ===== Durcissement anti-spoofing GPS sur les duels =====
-- Le navigateur ne permet pas de prouver cryptographiquement une position :
-- on ne peut pas empêcher deux comptes complices de mentir tous les deux de la
-- même façon. On réduit donc la surface d'abus plutôt que de prétendre la
-- supprimer : précision GPS minimale exigée, et limite du nombre de duels
-- "rencontre physique" complétés par la même paire de joueurs par semaine
-- (empêche le farming XP/Sparks entre deux comptes qui se font toujours
-- gagner mutuellement sans bouger).

alter table duels add column if not exists challenger_accuracy_m double precision;
alter table duels add column if not exists opponent_accuracy_m double precision;

create or replace function submit_duel_location(p_duel_id uuid, p_lat double precision, p_lng double precision, p_accuracy_m double precision default null)
returns void as $$
declare
  v_duel duels;
begin
  if p_accuracy_m is not null and p_accuracy_m > 100 then
    raise exception 'Position trop imprécise (% m), réessaie avec une meilleure réception GPS', round(p_accuracy_m);
  end if;

  select * into v_duel from duels where id = p_duel_id and status = 'meeting';
  if v_duel.id is null then
    raise exception 'Duel not found or not in meeting phase';
  end if;

  if auth.uid() = v_duel.challenger_id then
    update duels set challenger_lat = p_lat, challenger_lng = p_lng, challenger_accuracy_m = p_accuracy_m where id = p_duel_id;
  elsif auth.uid() = v_duel.opponent_id then
    update duels set opponent_lat = p_lat, opponent_lng = p_lng, opponent_accuracy_m = p_accuracy_m where id = p_duel_id;
  else
    raise exception 'Not a participant';
  end if;

  select * into v_duel from duels where id = p_duel_id;
  if v_duel.challenger_lat is not null and v_duel.opponent_lat is not null and v_duel.meeting_lat is null then
    update duels
    set meeting_lat = (v_duel.challenger_lat + v_duel.opponent_lat) / 2,
        meeting_lng = (v_duel.challenger_lng + v_duel.opponent_lng) / 2
    where id = p_duel_id;
  end if;
end;
$$ language plpgsql security definer;

create or replace function confirm_duel_arrival(p_duel_id uuid, p_lat double precision, p_lng double precision, p_accuracy_m double precision default null)
returns void as $$
declare
  v_duel duels;
  v_distance double precision;
  v_recent_pair_duels integer;
begin
  if p_accuracy_m is not null and p_accuracy_m > 100 then
    raise exception 'Position trop imprécise (% m), réessaie avec une meilleure réception GPS', round(p_accuracy_m);
  end if;

  select * into v_duel from duels where id = p_duel_id and status = 'meeting';
  if v_duel.id is null or v_duel.meeting_lat is null then
    raise exception 'Duel not ready for arrival check';
  end if;

  v_distance := duel_distance_meters(p_lat, p_lng, v_duel.meeting_lat, v_duel.meeting_lng);
  if v_distance > 150 then
    raise exception 'Too far from meeting point (% m)', round(v_distance);
  end if;

  select count(*) into v_recent_pair_duels
  from duels d
  where d.status in ('active', 'finished')
  and d.created_at > now() - interval '7 days'
  and (
    (d.challenger_id = v_duel.challenger_id and d.opponent_id = v_duel.opponent_id)
    or (d.challenger_id = v_duel.opponent_id and d.opponent_id = v_duel.challenger_id)
  );
  if v_recent_pair_duels >= 5 then
    raise exception 'Trop de duels en face à face avec ce joueur cette semaine, réessaie plus tard';
  end if;

  if auth.uid() = v_duel.challenger_id then
    update duels set challenger_ready = true where id = p_duel_id;
  elsif auth.uid() = v_duel.opponent_id then
    update duels set opponent_ready = true where id = p_duel_id;
  else
    raise exception 'Not a participant';
  end if;

  select * into v_duel from duels where id = p_duel_id;
  if v_duel.challenger_ready and v_duel.opponent_ready then
    update duels
    set status = 'active', started_at = now(), ends_at = now() + (v_duel.duration_minutes || ' minutes')::interval
    where id = p_duel_id;
  end if;
end;
$$ language plpgsql security definer;
