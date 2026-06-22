# Merch — workflow simplifié

## Flow validé
1. App → onglet **Profil** → à côté du QR : bouton **"Commander mon merch"** + lien copiable
2. Lien = unique par user, format : `lavie.app/u/[pseudo]` ou `lavie.app/u/[short_id]`
3. Clic → site web boutique
4. Sur le site : champ pseudo (pré-rempli si connecté), champ lien (pré-rempli auto)
5. Aperçu live du t-shirt avec QR + pseudo
6. Achat → paiement → Printful imprime + livre

## Avantages de ta version
- ✅ Plus simple côté app (juste un lien, pas tout le tunnel d'achat dans l'app)
- ✅ Évite la commission Apple/Google 30% sur achat physique (Apple n'applique pas IAP sur biens physiques, mais site web = 0 friction)
- ✅ Site web devient hub (FAQ, blog, contact, presse plus tard)
- ✅ SEO indexable (chaque profil = page Google)

## Site web — V1 minimal
- Page d'accueil (pitch + download app)
- Page `/u/[pseudo]` (profil public + QR + bouton "Voir dans l'app")
- Page `/shop` (boutique merch)
- Page `/shop/customize?user=[id]` (commande perso)
- Mentions légales / CGV / privacy

### Stack site web
- **Next.js + Vercel** (gratuit jusqu'à 100 GB bandwidth)
- DB partagée avec l'app (Supabase = même backend)
- Stripe checkout (paiement)
- Printful API (impression)
- → 1-2 semaines de dev une fois MVP app prêt

## Format du lien
- Court : `lavie.app/u/maxou` (mieux pour t-shirt, mémorisable)
- Réservation pseudo unique global obligatoire dès inscription
- Pseudo modifiable ? → oui, mais alias permanent gardé (redirige ancien → nouveau)

---

# Spots — stratégie déploiement national

## Le défi
- France = 35 000 communes
- Tu peux pas créer manuellement chaque spot
- Sécurité + qualité = pas n'importe quel lieu

## Approche graduée

### Phase 1 — Lancement local (toi)
- Tu crées **manuellement 5-20 spots** dans ta ville (La Seyne-sur-Mer)
- Parc de la Navale = spot phare
- Bord de mer, places, parcs
- Tu testes la mécanique avec les premiers users
- → Tu prouves le concept localement avant scale

### Phase 2 — Top 20 villes France (équipe ou bénévoles)
- Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Bordeaux, Lille, etc.
- 5-10 spots officiels par ville
- Source data possible : **OpenStreetMap** (POI parcs publics, free, légal)
- Validation manuelle : photo Google Street View + check sécurité

### Phase 3 — Crowdsourcing communautaire
- Users niveau 20+ peuvent **proposer un spot**
- Workflow proposition :
  1. User envoie photo + GPS + description
  2. Modération équipe (toi + bénévoles + IA pour pré-filtre)
  3. Validation = badge "Découvreur" + XP bonus
- Filtres auto :
  - Pas adresse perso (zone résidentielle exclue)
  - Lieu public obligatoire (OSM tag "public")
  - Pas zones dangereuses connues
  - Pas écoles/hôpitaux/cimetières
  
### Phase 4 — International
- Même logique, ville par ville
- Communauté locale propose + équipe valide

## Hiérarchie des spots

### Type A — Spots officiels (validés équipe)
- Garantis sûrs, photo vérifiée
- Apparaissent en gros sur la carte
- Capacité grosse (jusqu'à 100+ users simultané)

### Type B — Spots communauté validés
- Proposés users niveau 20+
- Validés modération
- Apparaissent normal

### Type C — Spots éphémères (V3+)
- Évènements organisés (Marathon, festival, etc.)
- Durée limitée
- Bonus XP gros

## Capacité d'un spot

Pour gérer 200 joueurs au Parc de la Navale :

- **Sous-zones dans un grand spot** (entrées, fontaines, terrains)
- Système de "salons" auto (max 50 joueurs/salon, plusieurs salons par spot)
- Affichage live : "147 joueurs présents"
- Carte de chaleur de l'app : zones les + actives

## Évènements communauté

**"Rassemblements LaVie"** mensuels :
- 1× par mois, samedi matin, dans un parc
- Tous les joueurs locaux invités
- Bonus XP × 3 pendant l'événement
- Possibilité partenariats locaux (mairie, asso, marque sport)
- → tu deviens **organisateur de communauté locale**, pas juste une app

### Avantages
- Acquisition organique (les gens voient le rassemblement → curiosité)
- Bouche-à-oreille local
- Médias locaux intéressés (presse régionale adore ce genre d'histoires)
- Pub physique légitime

---

# Pub physique / pancartes

## Idées légales

### Sur spots officiels
- Si partenariat **mairie / asso** → pancarte physique : "Spot officiel LaVie — Parc de la Navale"
- Sinon : interdit (affichage sauvage = amende)

### Démarche mairies
- Contact service jeunesse + sport
- Pitch : "App qui pousse les jeunes à bouger, à nettoyer la ville, à voter, à se rencontrer IRL"
- Tu peux décrocher :
  - Pancartes officielles (mairie offre)
  - Subventions (CAF jeunesse, ARS santé, Région)
  - Mention sur site officiel mairie
  - Évènements co-organisés
- → **Carte maîtresse de ta ville** : commence par ta mairie, La Seyne-sur-Mer, dossier d'1 page

### Partenariats lieux publics
- **Décathlon, salles sport, bibliothèques, MJC**
- Pancarte chez eux en échange visibilité
- "Spot LaVie ici — défi quotidien"

### Évènements
- Marathon, salon étudiant, salon santé
- Stand + démo
- Distribution stickers QR

### Pub virale physique (zéro coût)
- **Stickers QR** dispatchés en ville (avec accord mairie sur supports autorisés)
- Tu colles sur tes propres affaires (gourde, sac, casque)
- Tu donnes aux ambassadeurs early
- Effet "scan curiosité" → adoption

---

## Reco prochaine étape

Avant d'aller plus loin sur les features, on **passe au plan de dev concret**.

J'ai besoin de tes 3 réponses du fichier 12 :
1. **Nom** : luavio, REELZ, BeUp, UPPER, ou autre ?
2. **Direction artistique** : A (premium minimal), B (gamer RPG), C (sportif hybride — ma reco) ?
3. **Compétition hebdo V1 simplifiée** : oui (reco) / non V2 ?

Une fois ces 3 trucs validés je te fais le **plan de dev sprint par sprint** + on commence à coder.
