-- Schéma V1 minimal. À exécuter dans Supabase → SQL Editor.
-- Voir docs/22_RECAP_FINAL.md pour le schéma complet prévu (tasks, xp_logs, ranks...).

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  pseudo text unique,
  total_xp integer not null default 0,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Crée automatiquement une ligne profiles à l'inscription.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
