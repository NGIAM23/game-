# Décisions finales actées

| Item | Choix |
|---|---|
| Nom | **luavio** (provisoire, à reconsidérer plus tard) |
| Direction artistique | **C** — Sportif hybride (Strava × Solo Leveling × Duolingo) |
| Compétition hebdo V1 | **OUI** simplifiée (XP×2 dimanche + classement 24h, pas de récompense €) |

→ Tout est tranché. Avant plan dev, **checklist anti-oublis**.

---

# Ce qui manque encore à clarifier

## A. Identité visuelle luavio

Même si le nom reste provisoire, il faut décider :
- **Logo** : à créer (toi sur Figma/Canva ou Fiverr 50-150 €)
- **Couleurs primaires** : à figer maintenant pour cohérence dev
  - Reco DA C : noir anthracite (#0A0A0A) + accent vif (rouge #FF3B30 OR orange #FF6B00 OR vert lime #C6FF00)
  - Choisis 1 accent → moi je propose **vert lime #C6FF00** (énergie + santé + différenciant Strava qui est orange)
- **Typo** : Inter (gratuit) ou SF Pro Display (iOS) + JetBrains Mono pour stats
- **Logo concept** : à créer après accord couleurs

→ Dis : couleur accent rouge / orange / vert lime / autre ?

## B. Pseudo system
- Format autorisé : a-z, 0-9, _, ., 3-20 chars
- Unique global
- Modifiable 1× / 90 jours (sinon abus QR/lien)
- Pseudo réservé en majuscules sur affichage
- Liste mots interdits (insultes, marques)

## C. Avatar
- Solution choisie : **Ready Player Me 2D** (gratuit, intégrable) OR **DiceBear** (open source SVG)
- Reco : **DiceBear "Avataaars" ou "Lorelei"** → gratuit, illimité, customisable in-app, légèreté
- Personnalisation : cheveux, peau, vêtements (cosmétiques = sparks)

→ DiceBear OK ?

## D. Catégories XP finales

Confirmation des 6 :
1. 💪 Corps
2. 🧠 Esprit
3. ❤️ Social
4. 🤝 Altruisme
5. 💼 Productivité
6. 🎨 Création
7. (+ stat masquée 💎 Détox écran ?)

→ On en garde 6 ? On ajoute Détox écran en 7e ? Ma reco : **garder 6, intégrer "détox" dans Esprit avec gros bonus XP**, sinon trop de stats à gérer en UI.

## E. Devise sparks
- Nom de la monnaie : **Sparks** / **Lumens** / **Crystals** / autre ?
- Reco : **Sparks** ⚡ (court, gen Z, universel)
- Symbole : ⚡

→ Sparks OK ?

## F. Pass mensuel — naming
- "luavio+" ? "luavio Pro" ? "luavio Premium" ?
- Reco : **luavio+** (concision Apple/Spotify style)

→ OK ?

## G. Niveau de l'IA vérif V1
- Choix : **Gemini Flash gratuit** (15 req/min, 1500/jour)
- Suffit pour 100-500 beta testers
- Bascule Claude Haiku quand traction

→ OK ?

## H. KYC V1
- Choix : **Yoti Age Estimation** (gratuit, selfie)
- Pour features sociales (duels inconnus, radar)
- Inscription standard = email + Yoti selfie
- Si Yoti dit <18 → mode mineur (pas de social inconnu)

→ OK ?

## I. Stockage photos
- Compression côté client avant upload (max 1MB par image)
- Stockage Supabase Storage
- Suppression auto photos preuve après 30 jours (sauf opt-in galerie profil)
- → réduire coûts + RGPD

→ OK ?

## J. Langue V1
- Français uniquement V1 (pilote France)
- i18n prévue dans le code (clés de traduction)
- Anglais ajouté V2 quand expansion

→ OK ?

## K. Plateforme prioritaire MVP
Tu as dit iOS + Android simultanés. React Native + Expo → c'est fait nativement.
**MAIS** TestFlight (iOS beta) plus simple que Google Play Internal Testing au début.
→ Reco : développer cross-platform, **tester d'abord sur Android** (ton tel ?) avec Expo Go (pas besoin de build), publier iOS + Android en même temps en prod.

→ Tu es sur iPhone ou Android ?

## L. Compte développeur
- **Apple Developer Program** : 99 $/an, **à prendre maintenant** (1-2 jours validation)
- **Google Play Console** : 25 $ one-shot, **à prendre maintenant**
- → ~110 € à débourser cette semaine

→ Tu valides la dépense ?

## M. Domaine + handles
- Vérifier dispo **luavio.com / .app / .fr**
- Réserver tous les handles : Instagram, TikTok, X, YouTube, GitHub
- Faire MAINTENANT avant que quelqu'un les prenne

→ Tu confirmes le réserver aujourd'hui ?

## N. Repo Git
- GitHub privé : `luavio` ou `luavio-app`
- 1 repo monorepo : `apps/mobile`, `apps/web`, `packages/shared`
- → je te guide pour le setup

→ OK pour monorepo ?

## O. Légal V1 — minimum
- **CGU + Privacy Policy** : générateur en ligne (Termly, iubenda) → 0-30 €/an OU rédaction perso (template)
- **Mentions légales** : obligatoires
- **Hébergement EU** : Supabase Frankfurt ✅
- **DPO** : toi-même au début
- **Conformité CNIL** : registre traitements (template gouv.fr)
- → ~0-50 € pour V1, vraie revue avocat à 1k DAU

→ OK pour démarrer DIY (CGU/Privacy via Termly/iubenda) ?

---

# Récap actions IMMÉDIATES

À faire dans les **48h** :

1. ☐ Vérifier dispo `luavio.com`, `.app`, `.fr` (Gandi, OVH, Namecheap)
2. ☐ Réserver le domaine choisi (~10-15 €/an)
3. ☐ Réserver handles : @luavio sur Instagram, TikTok, X, YouTube, GitHub
4. ☐ Compte Apple Developer (99 $)
5. ☐ Compte Google Play Console (25 $)
6. ☐ Créer compte Supabase (gratuit)
7. ☐ Créer compte Expo / EAS (gratuit)
8. ☐ Créer compte Google AI Studio pour Gemini API (gratuit)
9. ☐ Répondre aux points A-O ci-dessus

---

# Une fois ça fait → je fais le plan de dev

Plan de dev structuré que je préparerai :
- **Sprint 0** : setup environnement, repo, Supabase schema, design system
- **Sprint 1** : Auth + inscription + onboarding + profil
- **Sprint 2** : Tâches du jour + caméra + IA vérif
- **Sprint 3** : XP, niveaux, rangs, stats
- **Sprint 4** : Classements
- **Sprint 5** : Streak, récompenses quotidiennes
- **Sprint 6** : QR code + scan + amis
- **Sprint 7** : Compétition hebdo V1
- **Sprint 8** : Pass mensuel + sparks
- **Sprint 9** : Polish, tests, déploiement TestFlight + Internal Test
- **Sprint 10** : Beta privée + ajustements
- **Sprint 11** : Lancement public stores

Chaque sprint = 1-2 semaines en mode pair-programming.
Total visé MVP : **3-4 mois**.

---

→ **Réponds rapidement aux 12 points A-O** (la plupart oui/non ou 1 choix court), et **fais les 8 actions des 48h**, et on attaque le code.
