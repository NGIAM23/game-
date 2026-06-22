-- Pool de tâches élargi (+ lieu), Sparks+ et stats catégories pour l'owner.
-- À exécuter après 04_sparks_avatar_sunday.sql, dans Supabase → SQL Editor.

-- Lieu de la tâche : à faire chez soi, à l'extérieur/en déplacement, ou peu importe.
alter table tasks add column if not exists location text not null default 'any';
alter table tasks add column if not exists added_at timestamptz not null default now();

update tasks set location = 'home' where id in ('8h-sommeil', 'boite-mail-zero', 'menage-chambre', 'dessiner', 'ecrire-500-mots', 'lire-30min', 'mediter-10min');
update tasks set location = 'outside' where id in ('10k-pas', 'voir-ami', 'ramasser-dechet');

-- Nouvelles tâches : pour que la liste du jour ne se vide jamais vraiment.
insert into tasks (id, category, label, base_xp, location) values
  ('etirements-10min', 'corps', '10 min d''étirements', 15, 'home'),
  ('escaliers', 'corps', 'Prends les escaliers (pas l''ascenseur)', 10, 'outside'),
  ('marche-15min', 'corps', 'Marche 15 min en extérieur', 20, 'outside'),
  ('boire-2l-eau', 'corps', 'Boire 2L d''eau dans la journée', 15, 'any'),
  ('petit-dej-equilibre', 'corps', 'Petit-déj équilibré', 10, 'home'),
  ('podcast-educatif', 'esprit', 'Écouter un podcast éducatif', 15, 'any'),
  ('apprendre-mot-langue', 'esprit', 'Apprendre 5 mots dans une langue', 10, 'any'),
  ('journal-intime', 'esprit', 'Écrire dans un journal intime', 15, 'home'),
  ('sans-notif-1h', 'esprit', '1h sans notifications', 15, 'any'),
  ('complimenter-inconnu', 'social', 'Complimenter sincèrement quelqu''un', 15, 'outside'),
  ('aider-collegue', 'social', 'Aider un collègue/camarade', 20, 'any'),
  ('message-vieil-ami', 'social', 'Envoyer un message à un vieil ami', 10, 'any'),
  ('sourire-inconnus', 'social', 'Sourire à 3 inconnus dans la rue', 10, 'outside'),
  ('ceder-place', 'altruisme', 'Céder sa place / aider quelqu''un dans la rue', 15, 'outside'),
  ('tri-dechets', 'altruisme', 'Trier ses déchets / recycler', 10, 'home'),
  ('benevolat-1h', 'altruisme', '1h de bénévolat', 50, 'outside'),
  ('planifier-semaine', 'productivite', 'Planifier sa semaine', 15, 'home'),
  ('tache-en-retard', 'productivite', 'Finir une tâche en retard', 20, 'any'),
  ('bureau-range', 'productivite', 'Ranger son bureau/espace de travail', 15, 'home'),
  ('photo-creative', 'creation', 'Prendre une photo créative en extérieur', 15, 'outside'),
  ('musique-10min', 'creation', 'Jouer d''un instrument 10 min', 20, 'home'),
  ('recette-maison', 'creation', 'Cuisiner une recette maison', 25, 'home'),
  ('sans-tel-repas', 'detoxEcran', 'Repas sans téléphone', 15, 'any'),
  ('telephone-loin-nuit', 'detoxEcran', 'Téléphone hors de la chambre la nuit', 20, 'home')
on conflict (id) do nothing;

-- luavio+ (simulation beta, pas de paiement réel) + droits owner pour les stats.
alter table profiles add column if not exists is_plus boolean not null default false;
alter table profiles add column if not exists is_admin boolean not null default false;

-- +10% XP pour les abonnés luavio+, en plus du x3 détox et x2 dimanche.
create or replace function complete_task(p_task_id text)
returns integer as $$
declare
  v_base_xp integer;
  v_category text;
  v_xp integer;
  v_sparks integer;
  v_last_completed date;
  v_is_plus boolean;
begin
  select base_xp, category into v_base_xp, v_category from tasks where id = p_task_id;
  if v_base_xp is null then
    raise exception 'Unknown task %', p_task_id;
  end if;

  v_xp := case when v_category = 'detoxEcran' then v_base_xp * 3 else v_base_xp end;

  if extract(dow from current_date) = 0 then
    v_xp := v_xp * 2;
  end if;

  select is_plus into v_is_plus from profiles where id = auth.uid();
  if v_is_plus then
    v_xp := round(v_xp * 1.1);
  end if;

  v_sparks := greatest(1, v_xp / 5);

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

-- Active luavio+ sur ton propre compte (simulation, pas de paiement) — remplace 'ton_pseudo'.
-- update profiles set is_plus = true where pseudo = 'ton_pseudo';

-- Donne-toi les droits owner pour voir /admin — remplace 'ton_pseudo'.
-- update profiles set is_admin = true where pseudo = 'ton_pseudo';

-- % de complétion par catégorie, réservé aux comptes is_admin.
create or replace function category_stats()
returns table (category text, completions bigint, pct numeric)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin) then
    raise exception 'not authorized';
  end if;

  return query
  with totals as (select count(*)::numeric as total from task_completions)
  select
    t.category,
    count(*)::bigint as completions,
    round(100.0 * count(*) / greatest((select total from totals), 1), 1) as pct
  from task_completions tc
  join tasks t on t.id = tc.task_id
  group by t.category
  order by completions desc;
end;
$$;
