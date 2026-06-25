-- Retire l'ancienne catégorie "Bataille" (remplacée par le système de Duel ci-dessous).
delete from task_completions where task_id like 'bataille-%';
delete from tasks where category = 'bataille';

-- ===== Duels entre amis (distance ou réel) =====

alter table notifications add column if not exists link text;

create table if not exists duel_missions (
  id text primary key,
  label text not null,
  target integer not null default 1
);

insert into duel_missions (id, label, target) values
  ('duel-pompes', 'Faire 20 pompes', 1),
  ('duel-squats', 'Faire 30 squats', 1),
  ('duel-eau', 'Boire 500ml d''eau', 1),
  ('duel-marche', 'Marcher 1000 pas', 1),
  ('duel-lecture', 'Lire 5 pages', 1),
  ('duel-rangement', 'Ranger un coin de la maison', 1),
  ('duel-respiration', 'Faire 2 min de respiration profonde', 1),
  ('duel-gratitude', 'Écrire 3 choses pour lesquelles tu es reconnaissant', 1),
  ('duel-etirement', 'Faire 5 min d''étirements', 1),
  ('duel-photo-nature', 'Prendre une photo de la nature autour de toi', 1),
  ('duel-appel', 'Envoyer un message sympa à quelqu''un', 1),
  ('duel-planche', 'Tenir une planche 30 secondes', 1)
on conflict (id) do nothing;

create table if not exists duels (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('distance', 'reel')),
  challenger_id uuid not null references auth.users (id) on delete cascade,
  opponent_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'declined', 'meeting', 'active', 'finished', 'cancelled')),
  duration_minutes integer not null default 15,
  challenger_lat double precision,
  challenger_lng double precision,
  opponent_lat double precision,
  opponent_lng double precision,
  meeting_lat double precision,
  meeting_lng double precision,
  challenger_ready boolean not null default false,
  opponent_ready boolean not null default false,
  started_at timestamptz,
  ends_at timestamptz,
  winner_id uuid references auth.users (id),
  xp_boost_minutes integer not null default 30,
  created_at timestamptz not null default now()
);

alter table duels enable row level security;

drop policy if exists "Participants can view their duels" on duels;
create policy "Participants can view their duels"
  on duels for select
  using (auth.uid() = challenger_id or auth.uid() = opponent_id);

create table if not exists duel_assignments (
  duel_id uuid not null references duels (id) on delete cascade,
  mission_id text not null references duel_missions (id),
  primary key (duel_id, mission_id)
);

alter table duel_assignments enable row level security;

drop policy if exists "Participants can view their duel missions" on duel_assignments;
create policy "Participants can view their duel missions"
  on duel_assignments for select
  using (
    exists (
      select 1 from duels d
      where d.id = duel_assignments.duel_id
        and (d.challenger_id = auth.uid() or d.opponent_id = auth.uid())
    )
  );

create table if not exists duel_progress (
  duel_id uuid not null references duels (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  mission_id text not null references duel_missions (id),
  completed_at timestamptz not null default now(),
  primary key (duel_id, user_id, mission_id)
);

alter table duel_progress enable row level security;

drop policy if exists "Participants can view duel progress" on duel_progress;
create policy "Participants can view duel progress"
  on duel_progress for select
  using (
    exists (
      select 1 from duels d
      where d.id = duel_progress.duel_id
        and (d.challenger_id = auth.uid() or d.opponent_id = auth.uid())
    )
  );

alter table profiles add column if not exists xp_boost_until timestamptz;

-- Distance approximative en mètres entre deux points (Haversine).
create or replace function duel_distance_meters(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
returns double precision as $$
declare
  r constant double precision := 6371000;
  dlat double precision := radians(lat2 - lat1);
  dlng double precision := radians(lng2 - lng1);
  a double precision;
begin
  a := sin(dlat / 2) ^ 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ^ 2;
  return r * 2 * atan2(sqrt(a), sqrt(1 - a));
end;
$$ language plpgsql immutable;

create or replace function create_duel(p_opponent_id uuid, p_mode text, p_duration_minutes integer default 15)
returns uuid as $$
declare
  v_duel_id uuid;
begin
  if p_opponent_id = auth.uid() then
    raise exception 'Cannot duel yourself';
  end if;

  if not exists (
    select 1 from friends
    where status = 'accepted'
      and ((requester = auth.uid() and addressee = p_opponent_id) or (requester = p_opponent_id and addressee = auth.uid()))
  ) then
    raise exception 'Not friends';
  end if;

  insert into duels (mode, challenger_id, opponent_id, duration_minutes)
  values (p_mode, auth.uid(), p_opponent_id, p_duration_minutes)
  returning id into v_duel_id;

  insert into duel_assignments (duel_id, mission_id)
  select v_duel_id, id from duel_missions order by random() limit 5;

  insert into notifications (user_id, type, message, link)
  values (
    p_opponent_id,
    'duel_invite',
    case when p_mode = 'reel' then 'Tu as un défi en duel réel !' else 'Tu as un défi en duel à distance !' end,
    '/duel/' || v_duel_id
  );

  return v_duel_id;
end;
$$ language plpgsql security definer;

create or replace function respond_duel(p_duel_id uuid, p_accept boolean)
returns void as $$
declare
  v_duel duels;
begin
  select * into v_duel from duels where id = p_duel_id and opponent_id = auth.uid() and status = 'pending';
  if v_duel.id is null then
    raise exception 'Duel not found or not pending';
  end if;

  if not p_accept then
    update duels set status = 'declined' where id = p_duel_id;
    insert into notifications (user_id, type, message, link)
    values (v_duel.challenger_id, 'duel_declined', 'Ton défi en duel a été refusé.', null);
    return;
  end if;

  if v_duel.mode = 'distance' then
    update duels
    set status = 'active', started_at = now(), ends_at = now() + (v_duel.duration_minutes || ' minutes')::interval
    where id = p_duel_id;
  else
    update duels set status = 'meeting' where id = p_duel_id;
  end if;

  insert into notifications (user_id, type, message, link)
  values (v_duel.challenger_id, 'duel_accepted', 'Ton défi en duel a été accepté !', '/duel/' || p_duel_id);
end;
$$ language plpgsql security definer;

create or replace function submit_duel_location(p_duel_id uuid, p_lat double precision, p_lng double precision)
returns void as $$
declare
  v_duel duels;
begin
  select * into v_duel from duels where id = p_duel_id and status = 'meeting';
  if v_duel.id is null then
    raise exception 'Duel not found or not in meeting phase';
  end if;

  if auth.uid() = v_duel.challenger_id then
    update duels set challenger_lat = p_lat, challenger_lng = p_lng where id = p_duel_id;
  elsif auth.uid() = v_duel.opponent_id then
    update duels set opponent_lat = p_lat, opponent_lng = p_lng where id = p_duel_id;
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

-- Tolérance ~150m pour l'adresse approximative.
create or replace function confirm_duel_arrival(p_duel_id uuid, p_lat double precision, p_lng double precision)
returns void as $$
declare
  v_duel duels;
  v_distance double precision;
begin
  select * into v_duel from duels where id = p_duel_id and status = 'meeting';
  if v_duel.id is null or v_duel.meeting_lat is null then
    raise exception 'Duel not ready for arrival check';
  end if;

  v_distance := duel_distance_meters(p_lat, p_lng, v_duel.meeting_lat, v_duel.meeting_lng);
  if v_distance > 150 then
    raise exception 'Too far from meeting point (% m)', round(v_distance);
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

create or replace function complete_duel_mission(p_duel_id uuid, p_mission_id text)
returns void as $$
declare
  v_duel duels;
begin
  select * into v_duel from duels where id = p_duel_id and status = 'active';
  if v_duel.id is null then
    raise exception 'Duel not active';
  end if;

  if auth.uid() <> v_duel.challenger_id and auth.uid() <> v_duel.opponent_id then
    raise exception 'Not a participant';
  end if;

  if v_duel.ends_at < now() then
    raise exception 'Duel time is over';
  end if;

  insert into duel_progress (duel_id, user_id, mission_id) values (p_duel_id, auth.uid(), p_mission_id)
  on conflict do nothing;
end;
$$ language plpgsql security definer;

create or replace function finish_duel(p_duel_id uuid)
returns void as $$
declare
  v_duel duels;
  v_challenger_score integer;
  v_opponent_score integer;
  v_winner uuid;
begin
  select * into v_duel from duels where id = p_duel_id and status = 'active';
  if v_duel.id is null then
    raise exception 'Duel not active';
  end if;
  if v_duel.ends_at > now() then
    raise exception 'Duel not finished yet';
  end if;

  select count(*) into v_challenger_score from duel_progress where duel_id = p_duel_id and user_id = v_duel.challenger_id;
  select count(*) into v_opponent_score from duel_progress where duel_id = p_duel_id and user_id = v_duel.opponent_id;

  if v_challenger_score > v_opponent_score then
    v_winner := v_duel.challenger_id;
  elsif v_opponent_score > v_challenger_score then
    v_winner := v_duel.opponent_id;
  else
    v_winner := null;
  end if;

  update duels set status = 'finished', winner_id = v_winner where id = p_duel_id;

  if v_winner is not null then
    update profiles
    set xp_boost_until = greatest(coalesce(xp_boost_until, now()), now()) + (v_duel.xp_boost_minutes || ' minutes')::interval
    where id = v_winner;
  end if;

  insert into notifications (user_id, type, message, link)
  values
    (v_duel.challenger_id, 'duel_finished',
      case
        when v_winner = v_duel.challenger_id then 'Tu as gagné ton duel ! Boost XP activé.'
        when v_winner is null then 'Ton duel s''est terminé sur une égalité.'
        else 'Tu as perdu ton duel, retente ta chance !'
      end,
      '/duel/' || p_duel_id),
    (v_duel.opponent_id, 'duel_finished',
      case
        when v_winner = v_duel.opponent_id then 'Tu as gagné ton duel ! Boost XP activé.'
        when v_winner is null then 'Ton duel s''est terminé sur une égalité.'
        else 'Tu as perdu ton duel, retente ta chance !'
      end,
      '/duel/' || p_duel_id);
end;
$$ language plpgsql security definer;

-- Le boost XP double l'XP gagné sur les tâches normales pendant sa durée.
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
begin
  select base_xp, category, frequency into v_base_xp, v_category, v_frequency from tasks where id = p_task_id;
  if v_base_xp is null then
    raise exception 'Unknown task %', p_task_id;
  end if;

  v_xp := case when v_category = 'detoxEcran' then v_base_xp * 3 else v_base_xp end;

  if extract(dow from current_date) = 0 then
    v_xp := v_xp * 2;
  end if;

  select is_plus, xp_boost_until into v_is_plus, v_boost_until from profiles where id = auth.uid();
  if v_is_plus then
    v_xp := round(v_xp * 1.1);
  end if;

  if v_boost_until is not null and v_boost_until > now() then
    v_xp := v_xp * 2;
  end if;

  if p_verified then
    v_xp := round(v_xp * 1.15);
  end if;

  v_sparks := greatest(1, round(v_xp / 5.0)::integer);
  v_period := case when v_frequency = 'weekly' then date_trunc('week', current_date)::date else current_date end;

  insert into task_completions (user_id, task_id, xp_awarded, completed_on, verified)
  values (auth.uid(), p_task_id, v_xp, v_period, p_verified);

  select last_completed_on into v_last_completed from profiles where id = auth.uid();

  update profiles
  set
    total_xp = total_xp + v_xp,
    sparks = sparks + v_sparks,
    current_streak = case
      when v_last_completed = current_date then current_streak
      when v_last_completed = current_date - 1 then current_streak + 1
      else 1
    end,
    last_completed_on = current_date
  where id = auth.uid();

  return v_xp;
end;
$$ language plpgsql security definer;
