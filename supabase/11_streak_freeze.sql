-- Freeze de streak : protège la série en cas de jour manqué.
-- Chaque joueur démarre avec 1 freeze, en regagne via la boutique/les récompenses plus tard.

alter table profiles add column if not exists streak_freezes integer not null default 1;

create or replace function complete_task(p_task_id text)
returns integer as $$
declare
  v_base_xp integer;
  v_category text;
  v_xp integer;
  v_last_completed date;
  v_freezes integer;
begin
  select base_xp, category into v_base_xp, v_category from tasks where id = p_task_id;
  if v_base_xp is null then
    raise exception 'Unknown task %', p_task_id;
  end if;

  v_xp := case when v_category = 'detoxEcran' then v_base_xp * 3 else v_base_xp end;

  insert into task_completions (user_id, task_id, xp_awarded)
  values (auth.uid(), p_task_id, v_xp);

  select last_completed_on, streak_freezes into v_last_completed, v_freezes from profiles where id = auth.uid();

  update profiles
  set
    total_xp = total_xp + v_xp,
    current_streak = case
      when v_last_completed = current_date then current_streak
      when v_last_completed = current_date - 1 then current_streak + 1
      when v_last_completed = current_date - 2 and v_freezes > 0 then current_streak + 1
      else 1
    end,
    streak_freezes = case
      when v_last_completed = current_date - 2 and v_freezes > 0 then v_freezes - 1
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
