# KYC + Sécurité + Stratégie mairie

## 1. Vérification d'âge / identité — KYC

### Le vrai problème
- App avec rencontres IRL = **majeur ↔ mineur = catastrophe absolue**
- Si un adulte va voir un mineur via ton app → carrière finie, prison, médias
- Auto-déclaration date naissance = inutile, tout le monde ment
- → **KYC obligatoire pour features sociales/IRL**

### Niveaux de vérification proposés

#### Niveau 0 — Inscription simple
- Email + mot de passe + pseudo + date naissance déclarative
- Accès : tâches solo, classements, profil de base
- **Aucune feature sociale IRL**

#### Niveau 1 — KYC majorité confirmée
- Scan pièce d'identité (CNI, passeport, permis)
- Vérif âge + ID unique
- Débloque : duels IRL, carte radar, défis avec inconnus, merch
- **Obligatoire si tu veux rencontrer des inconnus**

#### Niveau 2 — KYC + selfie (anti-usurpation)
- Selfie + match avec photo ID
- Débloque : ambassadeur, organisateur évènements, modération
- Optionnel utilisateurs lambda

### Prestataires KYC en France

| Service | Prix/vérif | Notes |
|---|---|---|
| **Veriff** | ~1-2 € | Estonie, EU, rapide, doc + biométrie |
| **Onfido** | ~1-3 € | UK, qualité haut |
| **Ondato** | ~0,80-1,50 € | EU, moins cher |
| **Sumsub** | ~1-2 € | Couverture mondiale |
| **Yoti** | gratuit pour age verif simple | UK, "Age Estimation" via selfie sans ID, moins fiable mais gratuit |
| **IDnow** | ~2-3 € | Allemand, très utilisé banking |

### Stratégie coût zéro V1

**Option A : "Free + Pay-once" pour features sociales**
- Inscription gratuite, app utilisable solo
- Veux duels IRL ? → KYC à 1,99 € one-shot (payé par user, refacturé à toi → ~1 €)
- Tu absorbes 1 € en marge = filtre + sérieux
- → 50% des users feront pas KYC, 50% qui le font = engagés + safe

**Option B : KYC gratuit user, payé par toi**
- 1-2 € coût par user qui veut socialiser
- Trop cher si conversion sociale = 80%
- Possible si tu lèves fonds

**Option C : Yoti Age Estimation (gratuit)**
- Selfie → IA estime âge
- Précis à ±2 ans
- Si app dit "tu as 17 ans" mais user déclaré 18 → blocage features sociales
- → Coût zéro, suffisant en filtre 1er niveau
- → Reco **V1 budget mini**

### Reco V1
- **Inscription = email + selfie Yoti** (gratuit, vérifie >18 OR <18 grossièrement)
- Si Yoti dit >18 → accès features sociales IRL
- Si Yoti dit <18 → mode mineur (pas de duels avec inconnus, pas de radar, chat amis only)
- **Si user veut bypass Yoti** → option KYC payante 1,99 € (Veriff/Ondato)
- À partir de 10k DAU → KYC obligatoire systématique payé par toi (négociable à 0,50-0,80 €/vérif au volume)

---

## 2. Sécurité agressions / harcèlement

### Mesures techniques

**Avant le duel**
- KYC obligatoire pour duels avec inconnus
- Filtre âge ± 5 ans (un 30 ans ne peut pas duel avec un 18 ans inconnu)
- Filtre niveau ± 10 (équité)
- Spots = **lieux publics fréquentés uniquement** (jamais coins isolés)
- Heures restrictives : 8h-21h pour duels inconnus (modulable selon ville)
- Validation manuelle de chaque spot par équipe

**Pendant le duel**
- Géoloc des 2 joueurs trackée (partagée avec back, pas avec l'autre joueur)
- Bouton **SOS / Signaler** flottant pendant tout le duel
  - Tap = appel 17/112 + envoie ta position à modération
  - Anonyme pour l'autre joueur
- Chat in-game enregistré (modération + preuve si signalement)
- Le partenaire ne voit ta position précise que pendant le duel, jamais avant/après

**Après le duel**
- Note obligatoire de l'autre joueur (1-5 étoiles + flags rapides : 🟢 cool / 🟡 bizarre / 🔴 problème)
- Si 🔴 → ouverture ticket auto
- 3 flags 🟡 sur 30 jours → blocage features sociales
- 1 flag 🔴 confirmé → ban immédiat
- Possibilité de demander revue manuelle du chat / vidéos

**Modération communautaire**
- Trust score interne (jamais affiché user)
- Algorithme combine : âge compte, complétion KYC, ancienneté, flags, signalements donnés/reçus
- Score faible = features bridées (pas de duels inconnus, etc.)

### Mesures juridiques

**CGU spécifiques**
- Clause "comportement IRL responsable"
- Rappel que LaVie n'est **pas** responsable des actes des utilisateurs
- Obligation de respecter loi locale
- Acceptation à chaque duel

**RGPD strict**
- Délégué Protection Données (DPO) à nommer (toi au début)
- Privacy by design
- Données géoloc supprimées sous 30 jours
- Droit oubli respecté
- Audit annuel (3-5k € prestataire) après scale

**Partenariat asso de protection**
- Contact Brigade des Mineurs / e-Enfance / Pharos
- Engagement à signaler proactivement contenus suspects
- → tu obtiens "label" rassurant pour mairies + presse

### Mesures communautaires

**Onboarding sécurité**
- À l'inscription + premier duel : tuto sécurité obligatoire
- "Comment rester safe sur LaVie" (3 écrans)
- Engagement explicite checkbox

**Ambassadeurs locaux**
- Users niveau élevé, KYC complet, longue ancienneté = "Ambassadeurs"
- Rôle : accueillir nouveaux, modérer évènements locaux, signaler
- Récompensés (pass gratuit, badges, accès exclu)

**Évènements en présence d'adultes responsables**
- Rassemblements communauté : volontaires "Coachs LaVie" (KYC+ + casier judiciaire vérifié comme bénévoles asso)
- Casier judiciaire en France = obligatoire pour encadrement mineurs → gérable, ~30 €/personne

### Différenciation mineurs/majeurs

**<18 ans (mode mineur strict)**
- Pas de carte radar publique
- Duels uniquement avec amis confirmés (eux-mêmes <18 ou family check)
- Chat global désactivé (cercles privés only)
- Profil non indexable web
- Géoloc précise jamais partagée
- Notif parent à l'inscription (email parental obligatoire <15 ans, RGPD-K)
- → Sandbox sécurisée

**>18 ans**
- Features complètes après KYC

---

## 3. Stratégie mairie La Seyne-sur-Mer

### Reco stratégique

**Lance d'abord local, scale ensuite. Ne lance PAS national d'un coup.**

Raisons :
- Sans premier modèle réussi = pitch pas crédible aux autres villes
- Une ville pilote = case study + chiffres concrets
- Sécurité plus simple à gérer avec 1 ville
- Bouche-à-oreille local fort > pub nationale diluée
- La Seyne ≈ 65k habitants = échantillon idéal (pas trop petit, pas trop gros)

### Plan rdv mardi matin avec Dorian Minos

#### Préparation (à faire avant rdv)
1. **Dossier 4 pages PDF**, format pro :
   - Page 1 : Le projet (pitch, mission, ce que ça résout)
   - Page 2 : Pourquoi La Seyne en pilote (jeunesse, parcs, façade maritime, ports)
   - Page 3 : Bénéfices pour la ville (santé jeunes, lien social, propreté, civisme, image dynamique)
   - Page 4 : Ce que tu demandes (rien d'argent au début !) + ce que tu offres
2. **Démo visuelle** : maquettes Figma ou prototype, même non fonctionnel
3. **Identité projet** : nom, logo, slogan, look pro

#### Ce que tu lui demandes (par paliers)
1. **Soutien moral + autorisation officielle** (zéro coût mairie)
   - Lettre de soutien du maire = arme énorme
2. **Autorisation panneaux/pancartes** sur parcs publics
   - "Spot officiel LaVie — Parc de la Navale"
   - Tu finances pancartes, mairie autorise
3. **Co-organisation 1er rassemblement** (samedi matin, parc)
   - Présence service jeunesse + sport + comm
4. **Mention sur site officiel mairie / réseaux sociaux ville**
5. **Mise en relation** avec : service jeunesse, conseil municipal jeunes, écoles, MJC, asso sportives
6. **(Bonus)** Subvention Jeunesse / Sport / Innovation : 5-20k €

#### Ce que tu offres en échange
1. **Outil de mesure activité jeune** dans la ville (dashboards anonymes)
2. **Animation des parcs publics** (jeunes sortent, propreté +, lien social +)
3. **Image moderne et innovante** de la ville (presse locale Var-Matin)
4. **Engagement civique mesurable** (tâches "voter", "bénévolat" trackées)
5. **Exclusivité pilote** : La Seyne = première ville mondiale → narratif fort
6. **Pourcentage des paies pass** des utilisateurs locaux ? (à creuser, si subvention)

#### Anticipation questions/objections

**"RGPD ?"**
- Hébergement EU (Supabase Frankfurt)
- DPO nommé, mentions légales, opt-in granulaire
- Audit prévu post-scale
- Conformité CNIL

**"Sécurité agressions ?"**
- KYC obligatoire pour features IRL (cf. partie 2)
- Spots = lieux publics fréquentés uniquement
- Bouton SOS, modération, partenariat asso
- Comparable à Tinder/Bumble en termes de risques (vous les autorisez ?)

**"Et les mineurs ?"**
- Mode mineur strict, isolé
- Pas de contact inconnus
- Consentement parental <15

**"Pourquoi pas une appli portée par la ville ?"**
- Coût pour la ville = 0 €
- Maintenance = 0
- Tu fais le boulot, eux ont la visibilité
- Ils peuvent retirer leur soutien à tout moment

**"Et si ça ne marche pas ?"**
- Pilote 6-12 mois sans engagement long terme
- Indicateurs de succès clairs définis ensemble

**"Combien d'utilisateurs visés à La Seyne ?"**
- Objectif réaliste : 500-2000 actifs en 6 mois (1-3% pop)
- À 65k habitants × 25% <30 ans = 16k cible → 5-12% adoption = success

#### Posture à adopter

- Pas demandeur d'argent → tu portes le projet
- Pas naïf → tu connais les risques et les solutions
- Concret → exemples chiffrés, démo visuelle
- Local d'abord → "je suis Seynois, je veux que ma ville soit pionnière"
- Pas tout seul → mentionne assoc/écoles/MJC déjà contactées (si vrai)
- Ouvert au feedback → "qu'est-ce que vous me suggérez ?"

---

## 4. Stratégie de lancement — local vs national

### Reco : **modèle hybride**

**Lancement national app + spots à La Seyne uniquement.**

- App téléchargeable partout en France (Apple/Google ne géofencent pas par ville)
- Mais **carte de spots = seulement La Seyne au début**
- Users hors La Seyne : peuvent faire tâches solo, classements, mais pas de duels IRL
- Auto-déblocage progressif : quand X users actifs dans une nouvelle ville (ex : 50) → modération crée spots + ouverture locale

**Avantages**
- Pas de friction pour téléchargement national
- Bouche-à-oreille viral hors La Seyne possible
- Communauté locale forte → modèle réussi
- "Bientôt dans ta ville !" = teaser puissant
- Quand tu vas voir maire de Toulon → "20 users actifs chez vous attendent, voici les chiffres"

**Ordre d'expansion suggéré**
1. La Seyne-sur-Mer (pilote, 1-3 mois)
2. Toulon (juste à côté, capitalise pilote)
3. Marseille (gros volume, déjà des users probables)
4. Nice
5. Lyon, Paris (volume max, plus tard pour solidité)
6. Top 20 villes France
7. Belgique, Suisse, Québec (francophonie)
8. EU
9. Monde

---

## Verdict

✅ KYC obligatoire pour features IRL — Yoti gratuit V1, Veriff payant si user veut bypass.
✅ Sécurité : KYC + spots publics + SOS + modération + flags + mode mineur strict.
✅ Mairie La Seyne d'abord, dossier pro, demandes graduées sans argent direct.
✅ Lancement : app nationale, spots locaux d'abord, expansion à la traction.

→ Le projet devient **crédible** pour un maire avec cette structure.

---

## Encore à trancher (urgent pour plan dev)

1. **Nom** : luavio / REELZ / BeUp / UPPER / autre ?
2. **Direction artistique** : A (premium) / B (gamer) / C (sportif hybride — reco) ?
3. **Compétition hebdo V1 simplifiée** : oui / non V2 ?

→ Sans ces réponses je peux pas avancer sur plan dev concret.
