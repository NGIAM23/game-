-- Quêtes hebdomadaires et mensuelles : objectifs à moyen terme, en plus des tâches du jour.

create table if not exists quests (
  id text primary key,
  scope text not null check (scope in ('weekly', 'monthly')),
  label text not null,
  kind text not null check (kind in ('total_tasks', 'category_tasks', 'verified_tasks')),
  category text,
  target integer not null,
  reward_xp integer not null default 0,
  reward_sparks integer not null default 0
);

alter table quests enable row level security;

create policy "Quests are viewable by everyone"
  on quests for select
  using (true);

insert into quests (id, scope, label, kind, category, target, reward_xp, reward_sparks) values
  ('w-total-5', 'weekly', 'Termine 5 tâches cette semaine', 'total_tasks', null, 5, 40, 15),
  ('w-total-12', 'weekly', 'Termine 12 tâches cette semaine', 'total_tasks', null, 12, 100, 35),
  ('w-corps-3', 'weekly', '3 tâches Corps cette semaine', 'category_tasks', 'corps', 3, 50, 20),
  ('w-esprit-3', 'weekly', '3 tâches Esprit cette semaine', 'category_tasks', 'esprit', 3, 50, 20),
  ('w-social-3', 'weekly', '3 tâches Social cette semaine', 'category_tasks', 'social', 3, 50, 20),
  ('w-verified-3', 'weekly', '3 tâches vérifiées par l''IA cette semaine', 'verified_tasks', null, 3, 60, 25),
  ('m-total-30', 'monthly', 'Termine 30 tâches ce mois-ci', 'total_tasks', null, 30, 250, 100),
  ('m-altruisme-8', 'monthly', '8 tâches Altruisme ce mois-ci', 'category_tasks', 'altruisme', 8, 200, 80)
on conflict (id) do nothing;

create table if not exists quest_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  quest_id text not null references quests (id),
  period_start date not null,
  claimed boolean not null default false,
  primary key (user_id, quest_id, period_start)
);

alter table quest_progress enable row level security;

create policy "Users can view their own quest progress"
  on quest_progress for select
  using (auth.uid() = user_id);

create or replace function quest_period_start(p_scope text)
returns date as $$
begin
  return case when p_scope = 'weekly' then date_trunc('week', current_date)::date else date_trunc('month', current_date)::date end;
end;
$$ language plpgsql immutable;

-- Renvoie les quêtes actives avec la progression calculée à la volée à partir de task_completions.
create or replace function get_active_quests()
returns table(
  quest_id text, scope text, label text, target integer, reward_xp integer, reward_sparks integer,
  progress integer, claimed boolean
) as $$
begin
  return query
  select
    q.id, q.scope, q.label, q.target, q.reward_xp, q.reward_sparks,
    least(q.target, (
      case q.kind
        when 'total_tasks' then (
          select count(*)::integer from task_completions tc
          where tc.user_id = auth.uid() and tc.completed_on >= quest_period_start(q.scope)
        )
        when 'category_tasks' then (
          select count(*)::integer from task_completions tc
          join tasks t on t.id = tc.task_id
          where tc.user_id = auth.uid() and t.category = q.category and tc.completed_on >= quest_period_start(q.scope)
        )
        when 'verified_tasks' then (
          select count(*)::integer from task_completions tc
          where tc.user_id = auth.uid() and tc.verified and tc.completed_on >= quest_period_start(q.scope)
        )
        else 0
      end
    )) as progress,
    coalesce((
      select qp.claimed from quest_progress qp
      where qp.user_id = auth.uid() and qp.quest_id = q.id and qp.period_start = quest_period_start(q.scope)
    ), false) as claimed
  from quests q
  order by q.scope, q.target;
end;
$$ language plpgsql security definer;

create or replace function claim_quest(p_quest_id text)
returns void as $$
declare
  v_scope text;
  v_target integer;
  v_category text;
  v_kind text;
  v_reward_xp integer;
  v_reward_sparks integer;
  v_period date;
  v_progress integer;
  v_already_claimed boolean;
begin
  select scope, target, category, kind, reward_xp, reward_sparks into v_scope, v_target, v_category, v_kind, v_reward_xp, v_reward_sparks
  from quests where id = p_quest_id;
  if v_scope is null then
    raise exception 'Unknown quest %', p_quest_id;
  end if;

  v_period := quest_period_start(v_scope);

  v_progress := case v_kind
    when 'total_tasks' then (
      select count(*)::integer from task_completions tc
      where tc.user_id = auth.uid() and tc.completed_on >= v_period
    )
    when 'category_tasks' then (
      select count(*)::integer from task_completions tc
      join tasks t on t.id = tc.task_id
      where tc.user_id = auth.uid() and t.category = v_category and tc.completed_on >= v_period
    )
    when 'verified_tasks' then (
      select count(*)::integer from task_completions tc
      where tc.user_id = auth.uid() and tc.verified and tc.completed_on >= v_period
    )
    else 0
  end;

  if v_progress < v_target then
    raise exception 'Quest not completed yet';
  end if;

  insert into quest_progress (user_id, quest_id, period_start, claimed)
  values (auth.uid(), p_quest_id, v_period, true)
  on conflict (user_id, quest_id, period_start) do nothing
  returning claimed into v_already_claimed;

  if v_already_claimed is null then
    raise exception 'Quest already claimed';
  end if;

  update profiles set total_xp = total_xp + v_reward_xp, sparks = sparks + v_reward_sparks where id = auth.uid();
end;
$$ language plpgsql security definer;
