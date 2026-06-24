-- Rééquilibrage de la boutique façon jeu mobile : paliers de rareté avec prix progressifs.

alter table cosmetics add column if not exists rarity text not null default 'common' check (rarity in ('common', 'rare', 'epic', 'legendary'));

update cosmetics set price_sparks = 25, rarity = 'common' where id in ('bg-coral', 'bg-sky', 'bg-mint', 'bg-rose');
update cosmetics set price_sparks = 60, rarity = 'rare' where id in ('bg-lavender', 'bg-gold', 'bg-sunset', 'bg-ocean', 'bg-forest');
update cosmetics set price_sparks = 150, rarity = 'epic' where id in ('bg-midnight');
update cosmetics set price_sparks = 450, rarity = 'legendary' where id in ('bg-rainbow');

update cosmetics set price_sparks = 60, rarity = 'rare' where id in ('badge-verified', 'badge-streak', 'badge-clan', 'badge-coach');
update cosmetics set price_sparks = 140, rarity = 'epic' where id in ('badge-coeur');
update cosmetics set price_sparks = 380, rarity = 'legendary' where id in ('badge-champion');

update cosmetics set price_sparks = 20, rarity = 'common' where id in ('title-debutant');
update cosmetics set price_sparks = 90, rarity = 'rare' where id in ('title-discipline');
update cosmetics set price_sparks = 400, rarity = 'legendary' where id in ('title-legende');
