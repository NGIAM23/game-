-- Récap mensuel "Wrapped" : stats fun du mois en cours, façon Spotify Wrapped.

create or replace function get_monthly_wrapped()
returns table(
  month_label text,
  total_tasks integer,
  total_xp integer,
  verified_count integer,
  top_category text,
  top_category_count integer,
  busiest_weekday text,
  longest_streak_in_month integer,
  current_streak integer
) as $$
declare
  v_month_start date := date_trunc('month', current_date)::date;
begin
  return query
  with month_completions as (
    select tc.*, t.category from task_completions tc
    join tasks t on t.id = tc.task_id
    where tc.user_id = auth.uid() and tc.completed_on >= v_month_start
  ),
  weekday_counts as (
    select extract(dow from completed_on)::integer as dow, count(*) as n
    from month_completions
    group by 1 order by n desc limit 1
  ),
  cat_counts as (
    select category, count(*) as n from month_completions group by category order by n desc limit 1
  ),
  distinct_days as (
    select distinct completed_on from month_completions order by completed_on
  ),
  streaks as (
    select completed_on,
      completed_on - (row_number() over (order by completed_on))::integer as grp
    from distinct_days
  ),
  streak_lengths as (
    select count(*) as len from streaks group by grp
  )
  select
    to_char(v_month_start, 'TMMonth YYYY'),
    (select count(*)::integer from month_completions),
    (select coalesce(sum(xp_awarded), 0)::integer from month_completions),
    (select count(*)::integer from month_completions where verified),
    (select category from cat_counts),
    (select n::integer from cat_counts),
    (select case (select dow from weekday_counts)
      when 0 then 'Dimanche' when 1 then 'Lundi' when 2 then 'Mardi' when 3 then 'Mercredi'
      when 4 then 'Jeudi' when 5 then 'Vendredi' when 6 then 'Samedi' end),
    (select coalesce(max(len), 0)::integer from streak_lengths),
    (select current_streak from profiles where id = auth.uid());
end;
$$ language plpgsql security definer;
