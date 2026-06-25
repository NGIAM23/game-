-- Paiements Stripe, cosmétiques, amis, tâches hebdo, notifications, preuve photo.
-- À exécuter après 05_tasks_pool_admin_plus.sql, dans Supabase → SQL Editor.

-- ===== Preuve photo + vérif IA =====
alter table task_completions add column if not exists verified boolean not null default false;

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
begin
  select base_xp, category, frequency into v_base_xp, v_category, v_frequency from tasks where id = p_task_id;
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

  if p_verified then
    v_xp := round(v_xp * 1.15);
  end if;

  v_sparks := greatest(1, round(v_xp / 5.0)::integer);
  v_period := case when v_frequency = 'weekly' then date_trunc('week', current_date)::date else current_date end;

  insert into task_completions (user_id, task_id, xp_awarded, completed_on, verified)
  values (auth.uid(), p_task_id, v_xp, v_period, p_verified);

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

-- ===== Tâches hebdo =====
alter table tasks add column if not exists frequency text not null default 'daily';

insert into tasks (id, category, label, base_xp, location, frequency) values
  ('hebdo-sport-3x', 'corps', 'Faire du sport 3 fois cette semaine', 60, 'any', 'weekly'),
  ('hebdo-lecture-livre', 'esprit', 'Finir un chapitre de livre', 50, 'home', 'weekly'),
  ('hebdo-appel-famille', 'social', 'Appeler un proche cette semaine', 40, 'any', 'weekly'),
  ('hebdo-benevolat', 'altruisme', 'Faire une action bénévole cette semaine', 70, 'outside', 'weekly'),
  ('hebdo-rangement', 'productivite', 'Grand rangement hebdomadaire', 50, 'home', 'weekly'),
  ('hebdo-projet-creatif', 'creation', 'Avancer un projet créatif cette semaine', 60, 'any', 'weekly'),
  ('hebdo-jeune-numerique', 'detoxEcran', 'Une journée complète sans réseaux sociaux', 80, 'any', 'weekly')
on conflict (id) do nothing;

-- ===== Paiements Stripe =====
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_session_id text not null unique,
  kind text not null check (kind in ('plus_subscription', 'sparks_pack')),
  sparks_awarded integer not null default 0,
  amount_cents integer not null,
  created_at timestamptz not null default now()
);

alter table payments enable row level security;

create policy "Users can view their own payments"
  on payments for select
  using (auth.uid() = user_id);

-- ===== Cosmétiques (boutique Sparks) =====
create table if not exists cosmetics (
  id text primary key,
  name text not null,
  kind text not null check (kind in ('avatar_bg', 'badge')),
  value text not null,
  price_sparks integer not null
);

alter table cosmetics enable row level security;

create policy "Cosmetics are viewable by everyone"
  on cosmetics for select
  using (true);

insert into cosmetics (id, name, kind, value, price_sparks) values
  ('bg-coral', 'Fond Corail', 'avatar_bg', '#FF6B6B', 40),
  ('bg-sky', 'Fond Ciel', 'avatar_bg', '#4DABF7', 40),
  ('bg-mint', 'Fond Menthe', 'avatar_bg', '#51CF66', 40),
  ('bg-lavender', 'Fond Lavande', 'avatar_bg', '#9775FA', 50),
  ('bg-gold', 'Fond Or', 'avatar_bg', '#FFD43B', 80),
  ('badge-verified', 'Badge Vérifié IA', 'badge', '✅', 60),
  ('badge-streak', 'Badge Flamme', 'badge', '🔥', 60)
on conflict (id) do nothing;

create table if not exists profile_cosmetics (
  user_id uuid not null references auth.users (id) on delete cascade,
  cosmetic_id text not null references cosmetics (id),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, cosmetic_id)
);

alter table profile_cosmetics enable row level security;

create policy "Users can view their own cosmetics"
  on profile_cosmetics for select
  using (auth.uid() = user_id);

alter table profiles add column if not exists equipped_avatar_bg text references cosmetics (id);
alter table profiles add column if not exists equipped_badge text references cosmetics (id);

create or replace function purchase_cosmetic(p_cosmetic_id text)
returns void as $$
declare
  v_price integer;
  v_sparks integer;
begin
  select price_sparks into v_price from cosmetics where id = p_cosmetic_id;
  if v_price is null then
    raise exception 'Unknown cosmetic %', p_cosmetic_id;
  end if;

  select sparks into v_sparks from profiles where id = auth.uid();
  if v_sparks < v_price then
    raise exception 'Not enough sparks';
  end if;

  update profiles set sparks = sparks - v_price where id = auth.uid();
  insert into profile_cosmetics (user_id, cosmetic_id) values (auth.uid(), p_cosmetic_id)
  on conflict do nothing;
end;
$$ language plpgsql security definer;

-- Secret connu uniquement du serveur Next.js (jamais exposé au client), pour empêcher
-- un utilisateur d'appeler credit_payment directement depuis la console du navigateur
-- avec un faux session_id et se créditer des Sparks gratuitement.
create table if not exists app_secrets (
  key text primary key,
  value text not null
);

alter table app_secrets enable row level security;
-- Volontairement aucune policy : ni anon ni authenticated ne peuvent lire cette table.
-- Seules les fonctions security definer (propriétaire postgres) peuvent y accéder.

insert into app_secrets (key, value) values ('stripe_credit_secret', 'REPLACE_WITH_YOUR_SECRET')
on conflict (key) do nothing;

-- Crédite des Sparks après un paiement Stripe vérifié côté serveur (route API, pas client).
-- p_secret doit correspondre à app_secrets.stripe_credit_secret, connu uniquement de la route API.
create or replace function credit_payment(
  p_user_id uuid,
  p_stripe_session_id text,
  p_kind text,
  p_sparks_awarded integer,
  p_amount_cents integer,
  p_secret text
)
returns void as $$
begin
  if p_secret is null or p_secret <> (select value from app_secrets where key = 'stripe_credit_secret') then
    raise exception 'not authorized';
  end if;

  insert into payments (user_id, stripe_session_id, kind, sparks_awarded, amount_cents)
  values (p_user_id, p_stripe_session_id, p_kind, p_sparks_awarded, p_amount_cents)
  on conflict (stripe_session_id) do nothing;

  -- Stripe peut redélivrer le même webhook plusieurs fois : si la session a
  -- déjà été enregistrée, l'insert ci-dessus ne fait rien et on ne doit pas
  -- créditer une seconde fois.
  if not found then
    return;
  end if;

  if p_kind = 'plus_subscription' then
    update profiles set is_plus = true where id = p_user_id;
  end if;

  if p_sparks_awarded > 0 then
    update profiles set sparks = sparks + p_sparks_awarded where id = p_user_id;
  end if;
end;
$$ language plpgsql security definer;

-- ===== Amis =====
create table if not exists friends (
  requester uuid not null references auth.users (id) on delete cascade,
  addressee uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  primary key (requester, addressee)
);

alter table friends enable row level security;

create policy "Users can view their own friend links"
  on friends for select
  using (auth.uid() = requester or auth.uid() = addressee);

create policy "Users can send friend requests"
  on friends for insert
  with check (auth.uid() = requester and requester <> addressee);

create policy "Addressee can accept requests"
  on friends for update
  using (auth.uid() = addressee);

create policy "Users can remove their own friend links"
  on friends for delete
  using (auth.uid() = requester or auth.uid() = addressee);

-- ===== Notifications in-app =====
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;

create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);

create or replace function notify_friend_request()
returns trigger as $$
begin
  insert into notifications (user_id, type, message)
  values (new.addressee, 'friend_request', 'Tu as une nouvelle demande d''ami.');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_friend_request_created
  after insert on friends
  for each row execute procedure notify_friend_request();

create or replace function notify_friend_accepted()
returns trigger as $$
begin
  if old.status = 'pending' and new.status = 'accepted' then
    insert into notifications (user_id, type, message)
    values (new.requester, 'friend_accepted', 'Ta demande d''ami a été acceptée !');
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_friend_request_accepted
  after update on friends
  for each row execute procedure notify_friend_accepted();
