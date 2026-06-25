-- Sparks ⚡, avatars DiceBear et Course du Dimanche. À exécuter après 03_streaks.sql, dans Supabase → SQL Editor.

alter table profiles add column if not exists sparks integer not null default 0;
alter table profiles add column if not exists avatar_seed text;

-- Remplace complete_task() pour : XP ×2 le dimanche (Course du Dimanche) + crédit Sparks.
create or replace function complete_task(p_task_id text)
returns integer as $$
declare
  v_base_xp integer;
  v_category text;
  v_xp integer;
  v_sparks integer;
  v_last_completed date;
begin
  select base_xp, category into v_base_xp, v_category from tasks where id = p_task_id;
  if v_base_xp is null then
    raise exception 'Unknown task %', p_task_id;
  end if;

  v_xp := case when v_category = 'detoxEcran' then v_base_xp * 3 else v_base_xp end;

  -- Course du Dimanche V1 : XP ×2 le dimanche (cf docs/22_RECAP_FINAL.md §09).
  if extract(dow from current_date) = 0 then
    v_xp := v_xp * 2;
  end if;

  v_sparks := greatest(1, round(v_xp / 5.0)::integer);

  insert into task_completions (user_id, task_id, xp_awarded)
  values (auth.uid(), p_task_id, v_xp);

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

-- Classement de la Course du Dimanche (XP gagné aujourd'hui, uniquement si on est dimanche).
-- security definer car task_completions est normalement filtré par RLS à l'utilisateur courant.
create or replace function sunday_leaderboard()
returns table (pseudo text, avatar_seed text, sunday_xp bigint)
language sql
security definer
set search_path = public
stable
as $$
  select p.pseudo, p.avatar_seed, sum(tc.xp_awarded) as sunday_xp
  from task_completions tc
  join profiles p on p.id = tc.user_id
  where tc.completed_on = current_date
    and extract(dow from current_date) = 0
    and p.pseudo is not null
  group by p.pseudo, p.avatar_seed
  order by sunday_xp desc
  limit 10;
$$;
