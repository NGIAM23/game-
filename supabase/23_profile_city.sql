-- Ajoute la ville du joueur pour permettre un classement local (lancement à La Seyne-sur-Mer).
alter table profiles add column if not exists city text;

create index if not exists profiles_city_idx on profiles (city);
