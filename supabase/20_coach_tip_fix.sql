-- Corrige get_coach_tip() : l'id et le label suggérés provenaient de deux tirages
-- aléatoires indépendants et pouvaient donc ne pas correspondre à la même tâche.
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
  ),
  suggestion as (
    select t.id, t.label from tasks t, worst where t.category = worst.cat_id and t.frequency = 'daily' order by random() limit 1
  )
  select
    worst.cat_id, worst.cat_label, worst.n::integer,
    suggestion.id, suggestion.label
  from worst left join suggestion on true;
end;
$$ language plpgsql security definer;
