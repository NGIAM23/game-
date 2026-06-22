-- Streaks. À exécuter après 02_tasks.sql, dans Supabase → SQL Editor.

alter table profiles add column if not exists current_streak integer not null default 0;
alter table profiles add column if not exists last_completed_on date;

-- Remplace complete_task() pour aussi mettre à jour le streak :
-- +1 si dernière complétion = hier, reset à 1 si rupture, inchangé si déjà fait aujourd'hui.
create or replace function complete_task(p_task_id text)
returns integer as $$
declare
  v_base_xp integer;
  v_category text;
  v_xp integer;
  v_last_completed date;
begin
  select base_xp, category into v_base_xp, v_category from tasks where id = p_task_id;
  if v_base_xp is null then
    raise exception 'Unknown task %', p_task_id;
  end if;

  v_xp := case when v_category = 'detoxEcran' then v_base_xp * 3 else v_base_xp end;

  insert into task_completions (user_id, task_id, xp_awarded)
  values (auth.uid(), p_task_id, v_xp);

  select last_completed_on into v_last_completed from profiles where id = auth.uid();

  update profiles
  set
    total_xp = total_xp + v_xp,
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
