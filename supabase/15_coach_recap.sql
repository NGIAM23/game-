-- Coach : suggère la catégorie la plus négligée des 14 derniers jours.
create or replace function get_coach_tip()
returns table(category text, label text, recent_count integer, suggested_task_id text, suggested_label text) as $$
declare
  v_period date := current_date - 13;
begin
  return query
  with counts as (
    select c.id as cat_id, c.label as cat_label, coalesce((
      select count(*) from task_completions tc
      join tasks t on t.id = tc.task_id
      where tc.user_id = auth.uid() and t.category = c.id and tc.completed_on >= v_period
    ), 0) as n
    from (values
      ('corps', 'Corps'), ('esprit', 'Esprit'), ('social', 'Social'), ('altruisme', 'Altruisme'),
      ('productivite', 'Productivité'), ('creation', 'Création'), ('detoxEcran', 'Détox écran')
    ) as c(id, label)
  ),
  worst as (
    select * from counts order by n asc, random() limit 1
  )
  select
    worst.cat_id, worst.cat_label, worst.n::integer,
    (select t.id from tasks t where t.category = worst.cat_id and t.frequency = 'daily' order by random() limit 1),
    (select t.label from tasks t where t.category = worst.cat_id and t.frequency = 'daily' order by random() limit 1)
  from worst;
end;
$$ language plpgsql security definer;

-- Récap hebdo : compare la semaine en cours à la semaine précédente.
create or replace function get_weekly_recap()
returns table(
  this_week_tasks integer, last_week_tasks integer, this_week_xp integer,
  top_category text, top_category_count integer, current_streak integer
) as $$
declare
  v_this_week date := date_trunc('week', current_date)::date;
  v_last_week date := v_this_week - 7;
begin
  return query
  select
    (select count(*)::integer from task_completions where user_id = auth.uid() and completed_on >= v_this_week),
    (select count(*)::integer from task_completions where user_id = auth.uid() and completed_on >= v_last_week and completed_on < v_this_week),
    (select coalesce(sum(xp_awarded), 0)::integer from task_completions where user_id = auth.uid() and completed_on >= v_this_week),
    (select t.category from task_completions tc join tasks t on t.id = tc.task_id
      where tc.user_id = auth.uid() and tc.completed_on >= v_this_week
      group by t.category order by count(*) desc limit 1),
    (select count(*)::integer from task_completions tc join tasks t on t.id = tc.task_id
      where tc.user_id = auth.uid() and tc.completed_on >= v_this_week
      group by t.category order by count(*) desc limit 1),
    (select current_streak from profiles where id = auth.uid());
end;
$$ language plpgsql security definer;
