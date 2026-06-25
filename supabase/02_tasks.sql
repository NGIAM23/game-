-- Système de tâches + XP. À exécuter après schema.sql, dans Supabase → SQL Editor.

create table if not exists tasks (
  id text primary key,
  category text not null,
  label text not null,
  base_xp integer not null
);

-- Pool de tâches V1 (sous-ensemble, cf packages/shared/src/tasks.ts et docs/11_taches_safe.md)
insert into tasks (id, category, label, base_xp) values
  ('sport-20min', 'corps', 'Séance sport ≥20 min', 30),
  ('10k-pas', 'corps', '10 000 pas', 25),
  ('8h-sommeil', 'corps', '8h de sommeil', 20),
  ('lire-30min', 'esprit', 'Lire 30 min', 25),
  ('mediter-10min', 'esprit', 'Méditer 10 min', 20),
  ('appeler-famille', 'social', 'Appeler la famille', 20),
  ('voir-ami', 'social', 'Voir un ami IRL', 30),
  ('ramasser-dechet', 'altruisme', 'Ramasser un déchet', 15),
  ('don-asso', 'altruisme', 'Don ≥5€ à une asso vérifiée', 40),
  ('boite-mail-zero', 'productivite', 'Boîte mail à zéro', 20),
  ('menage-chambre', 'productivite', 'Ménage chambre', 20),
  ('dessiner', 'creation', 'Dessiner / peindre', 25),
  ('ecrire-500-mots', 'creation', 'Écrire 500 mots', 25),
  ('limite-ecran', 'detoxEcran', 'Limite écran <2h', 30),
  ('pas-de-reseaux', 'detoxEcran', 'Pas de réseaux sociaux 1 jour', 35)
on conflict (id) do nothing;

alter table tasks enable row level security;

drop policy if exists "Tasks are viewable by everyone" on tasks;
create policy "Tasks are viewable by everyone"
  on tasks for select
  using (true);

-- Une complétion par tâche par jour par utilisateur.
create table if not exists task_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id text not null references tasks (id),
  xp_awarded integer not null,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, task_id, completed_on)
);

alter table task_completions enable row level security;

drop policy if exists "Users can view their own completions" on task_completions;
create policy "Users can view their own completions"
  on task_completions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own completions" on task_completions;
create policy "Users can insert their own completions"
  on task_completions for insert
  with check (auth.uid() = user_id);

-- Aucune modification ni suppression possible (preuve d'historique immuable).
drop policy if exists "Completions cannot be updated" on task_completions;
create policy "Completions cannot be updated"
  on task_completions for update
  using (false);

drop policy if exists "Completions cannot be deleted" on task_completions;
create policy "Completions cannot be deleted"
  on task_completions for delete
  using (false);

-- Complète une tâche aujourd'hui et crédite l'XP au profil de façon atomique.
-- Détox écran = XP ×3 (signature, cf docs/22_RECAP_FINAL.md §3).
create or replace function complete_task(p_task_id text)
returns integer as $$
declare
  v_base_xp integer;
  v_category text;
  v_xp integer;
begin
  select base_xp, category into v_base_xp, v_category from tasks where id = p_task_id;
  if v_base_xp is null then
    raise exception 'Unknown task %', p_task_id;
  end if;

  v_xp := case when v_category = 'detoxEcran' then v_base_xp * 3 else v_base_xp end;

  insert into task_completions (user_id, task_id, xp_awarded)
  values (auth.uid(), p_task_id, v_xp);

  update profiles set total_xp = total_xp + v_xp where id = auth.uid();

  return v_xp;
end;
$$ language plpgsql security definer;
