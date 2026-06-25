-- Freeze de streak : protège la série en cas de jour manqué.
-- Chaque joueur démarre avec 1 freeze, en regagne via la boutique/les récompenses plus tard.

alter table profiles add column if not exists streak_freezes integer not null default 1;

-- Supprime l'ancien overload à un seul paramètre devenu obsolète depuis 06_payments_cosmetics_social.sql
-- (sinon il coexiste avec la version (text, boolean) ci-dessous et reste appelable par erreur).
drop function if exists complete_task(text);

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
begin
  select base_xp, category, frequency into v_base_xp, v_category, v_frequency from tasks where id = p_task_id;
  if v_base_xp is null then
    raise exception 'Unknown task %', p_task_id;
  end if;

  -- Tous les multiplicateurs sont combinés en un seul facteur puis appliqués
  -- en une fois : appliquer round() après chaque étape ferait dériver le
  -- résultat selon l'ordre des bonus (ex: Plus + dimanche + vérifiée).
  declare
    v_multiplier numeric := 1;
  begin
    v_xp := case when v_category = 'detoxEcran' then v_base_xp * 3 else v_base_xp end;

    if extract(dow from current_date) = 0 then
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
  end;

  v_sparks := greatest(1, round(v_xp / 5.0)::integer);
  v_period := case when v_frequency = 'weekly' then date_trunc('week', current_date)::date else current_date end;

  insert into task_completions (user_id, task_id, xp_awarded, completed_on, verified)
  values (auth.uid(), p_task_id, v_xp, v_period, p_verified);

  select last_completed_on, streak_freezes into v_last_completed, v_freezes from profiles where id = auth.uid();

  update profiles
  set
    total_xp = total_xp + v_xp,
    sparks = sparks + v_sparks,
    current_streak = case
      when v_last_completed = current_date then current_streak
      when v_last_completed = current_date - 1 then current_streak + 1
      when v_last_completed = current_date - 2 and v_freezes > 0 then current_streak + 1
      else 1
    end,
    streak_freezes = case
      when v_last_completed <> current_date and v_last_completed = current_date - 2 and v_freezes > 0 then v_freezes - 1
      else v_freezes
    end,
    last_completed_on = current_date
  where id = auth.uid();

  return v_xp;
end;
$$ language plpgsql security definer;

-- Historique des jours actifs pour le calendrier de streak (35 derniers jours).
create or replace function get_streak_calendar()
returns table(day date, completed boolean) as $$
begin
  return query
  select d::date, exists(
    select 1 from task_completions tc
    where tc.user_id = auth.uid() and tc.completed_on = d::date
  )
  from generate_series(current_date - 34, current_date, interval '1 day') as d;
end;
$$ language plpgsql security definer;
