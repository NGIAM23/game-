# luavio — Récapitulatif complet

> Document de synthèse final. Toutes les décisions prises depuis le début du projet, dans l'ordre.

---

## 1. Identité projet

### Mission
> Le seul jeu où tu gagnes des niveaux dans la vraie vie, avec preuve.

### Positionnement
**Nouvelle catégorie : "preuve réelle"**. Ni habit tracker, ni RPG médiéval. Un réseau social de l'auto-amélioration vérifiée.

### Nom
**luavio** (provisoire). Domaine déjà acquis. À reconsidérer si meilleure idée émerge.

### Cible
- **Primaire** : 16-25 ans
- **Secondaire** : 25-35 ans
- **Géo** : France (La Seyne pilote) → francophonie → EU → monde

### Tagline
> "Devenir meilleur, pour de vrai."

---

## 2. Direction artistique (validée)

### Style
**"Sunshine"** — clair, fun, accessible. Inspiré Brawl Stars/Clash Royale modernisé. Adapté ados ET adultes.

### Palette
| Rôle | Couleur | Hex |
|---|---|---|
| Fond | Crème chaud | `#FFF8E7` |
| Surfaces | Blanc | `#FFFFFF` |
| Primary accent | Jaune doux miel | `#FFD43B` |
| Secondary accent | Violet vif | `#6750E8` |
| Contour | Quasi-noir | `#1A1A2E` |
| Couleurs catégories | Rouge, Bleu, Rose, Vert, Orange, Violet, Jaune | |

### Typographie
- **Lilita One** — titres (style Clash/Brawl, arrondi, fun)
- **Fredoka** — corps de texte
- **DM Mono** — chiffres et données

### Style graphique
- Bordures épaisses (2-3px noir)
- Ombres flat (offset bas)
- Coins arrondis généreux (14-24px)
- Boutons "stickers" qui s'enfoncent au tap
- Animations spring/bounce sur level-up

---

## 3. Gameplay core

### 7 catégories de XP / Stats
| Icône | Catégorie | Couleur |
|---|---|---|
| 💪 | Corps | Rouge |
| 🧠 | Esprit | Bleu |
| ❤️ | Social | Rose |
| 🤝 | Altruisme | Vert |
| 💼 | Productivité | Orange |
| 🎨 | Création | Violet |
| 📵 | Détox écran | Jaune |

### Système de niveaux
- Niveau quasi-infini (1 à 9999+)
- Formule XP : `XP_niveau_N = 100 × N^1.5`
- Bonus multiplicatifs : streak, pass, courbe régulière, événement, première fois

### Système de rangs (44 paliers)
**11 tiers × 4 niveaux (I, II, III, IV) = 44 paliers visuels**

| # | Tier | Niveaux |
|---|---|---|
| 1 | Fer I → IV | 1-10 |
| 2 | Bronze I → IV | 11-25 |
| 3 | Argent I → IV | 26-40 |
| 4 | Or I → IV | 41-60 |
| 5 | Platine I → IV | 61-90 |
| 6 | Diamant I → IV | 91-130 |
| 7 | Maître I → IV | 131-180 |
| 8 | Grand Maître I → IV | 181-260 |
| 9 | Héros I → IV | 261-400 |
| 10 | Légende I → IV | 401-700 |
| 11 | Mythique I → IV | 701+ |

Chaque palier : couleur, icône, animation montée, badge profil.

### Tâches
- 3 tâches quotidiennes obligatoires (gratuit), 5 avec pass
- 5 tâches hebdo
- Vérification : photo/vidéo + IA (Gemini Flash V1)
- ~120 tâches pool V1 (cf fichier 11)
- Tâches escaladent en difficulté avec progression
- **Tâches Détox écran = XP ×3-5** (signature)

### Compétition hebdo — "Course du Dimanche"
- Tous les dimanches, 24h
- XP ×2 sur toutes les tâches
- Classement séparé
- Récompenses Top 10 : cosmétiques, Sparks ⚡, pass gratuits (PAS d'argent V1)
- V2 : récompenses partenaires marques + classement local "King of Spot"

---

## 4. Économie

### Pass mensuel — **luavio+**
- ~3,99 €/mois
- 39,99 €/an
- 99 € lifetime (option fans)
- Bénéfices : +10% XP, 5 tâches/jour, 5 re-rolls, cosmétiques premium, stats avancées, badge profil

### Monnaie virtuelle — **Sparks ⚡**
- Achetable seulement (pas farmable, sinon dévalue)
- Packs : 0,99 € / 4,99 € / 9,99 € / 19,99 € / 49,99 €
- Usage : cosmétiques, re-rolls, boosts XP temporaires, débloquer tâches premium
- ❌ **Jamais d'achat direct d'XP** (corrompt la mission)
- Note marque : terme générique, utilisé dans d'autres jeux mais aucun ne l'a verrouillé. OK pour usage.

### Merch (V1.5)
- T-shirts/sweats/casquettes avec **QR code + pseudo personnalisés**
- Print on Demand via **Printful** (zéro stock)
- Marge ~17 €/t-shirt
- Site web séparé `luavio.app/shop`
- Commande depuis lien dans profil app

### B2B (V3+)
- "luavio for Teams" pour entreprises (bien-être employés)
- Mairies, mutuelles, RH
- 5-10 €/employé/mois

### Partenariats marques (V2+)
- Récompenses sponsorisées (Top 10 hebdo)
- Visibilité × commission

---

## 5. Fonctionnalités sociales

### QR Code profil (V1)
- Dans Settings + à côté du profil
- Lien `luavio.app/u/[pseudo]`
- Scan → profil public (niveau, rang, stats, streak, duels gagnés)
- Bouton "Ajouter en ami" / "Commander mon merch"

### Carte radar (V2)
- Pin joueurs autour, **opt-in strict**
- Position floutée ±50-100m
- Off par défaut, désactivable, jamais visible mineurs en mode publique
- Match IRL : 2 joueurs à <50m pendant 5min → notif "Saluer ?"

### Duels IRL — Spots de défi (V2)
- Spots officiels validés (parcs, places, salles sport)
- Rdv physique, scan QR mutuel = confirmation présence
- Liste missions rapides (15-30 min)
- Vainqueur : boost XP ×2 pendant 1-2h
- Perdant : rien de pénalisant
- Compteur duels gagnés affiché sur profil
- KYC obligatoire pour duels inconnus

### Mode Événement (V1.5)
- Admin (toi) + ambassadeurs créent
- Zone GPS, missions custom, équipes, classement live
- Sécurité : police municipale + bouton SOS + flags
- Usage : rassemblements La Seyne, partenariats assos

### Cercles / Guildes (V2)
- Groupes 5-20 amis
- Bonus XP collectif
- Défis de groupe hebdo

### Profil public
- Niveau, rang, stats radar, streak
- **Duels gagnés / total**
- Badges, succès
- Galerie tâches (opt-in)

---

## 6. Sécurité

### KYC (V1)
- **Yoti Age Estimation** (gratuit) — selfie + IA estime âge
- >18 → features sociales débloquées
- <18 → mode mineur strict
- Option payante Veriff (1,99 €) pour bypass

### Mode mineur strict (<18)
- Pas de radar publique
- Pas de duels inconnus (amis confirmés uniquement)
- Chat global désactivé
- Profil non indexable web
- Géoloc précise jamais partagée
- Consentement parental <15 (RGPD-K)

### Anti-triche
- Photos in-app obligatoires (pas galerie)
- EXIF + watermark dynamique
- Détection AI-generated
- IA multimodale + revue communautaire
- Trust score interne
- Validation croisée pour score bas

### Sécurité agressions (duels/events)
- KYC obligatoire pour features IRL
- Spots = lieux publics fréquentés uniquement
- Filtre âge ±5 ans, niveau ±10
- Heures 8h-21h
- Bouton SOS direct
- Géoloc tracée pendant duel (10-30 min, supprimée après)
- 3 flags 🟡 = blocage social 24h, 1 flag 🔴 = ban
- Trust score communautaire

### RGPD
- Hébergement Supabase Frankfurt (EU)
- Privacy by design
- DPO nommé (toi V1)
- Opt-in granulaire (géoloc, photos, profil public)
- Suppression auto photos après 30 jours (sauf opt-in galerie)
- Droit oubli respecté

---

## 7. Stack technique

| Couche | Outil | Coût |
|---|---|---|
| Mobile | React Native + Expo | 0 € |
| Backend / DB / Auth / Storage | Supabase | 0 € → 25 $/mois |
| Vérif IA images | Gemini Flash (V1) → Claude Haiku | 0 € → 27 €/mois |
| Détection AI-gen | Hugging Face open | 0 € |
| Push notifs | Expo Push | 0 € |
| Analytics | PostHog | 0 € (1M events/mois) |
| Crash reporting | Sentry | 0 € (5k events/mois) |
| Paiements | RevenueCat | 0 € (<2,5k$/mois) |
| Emails | Resend | 0 € (3k/mois) |
| KYC | Yoti Age Estimation | 0 € |
| Repo | GitHub privé | 0 € |
| Domaine | luavio (déjà acquis) | ~15 €/an |
| Apple Dev Program | (dans 4-6 sem) | 99 $/an |
| Google Play Console | (cette semaine) | 25 $ one-shot |
| Site web | Next.js + Vercel | 0 € |

**Total MVP : ~115 € one-shot. Mensuel à <10k users : ~10-30 €/mois.**

---

## 8. Stratégie de lancement

### Approche
**App nationale + spots géolocalisés La Seyne uniquement au début.**
Téléchargement libre dans toute la France, mais features sociales IRL réservées à La Seyne. Expansion progressive ville par ville.

### Phase 0 — Validation concept (S-2 à S0)
- Landing page (Carrd/Framer)
- Comptes réseaux teaser
- Sondage 100 cibles
- Réservation domaine + handles
- Comptes Google Play (Apple plus tard)

### Phase 1 — MVP dev (S1-S16, ~4 mois)
- Sprint par sprint en pair (toi + moi)
- Beta privée 50-200 testeurs

### Phase 2 — Lancement La Seyne (S17+)
- **RDV mairie Dorian Minos** (mardi matin)
  - Dossier 4 pages + démo
  - Demandes : soutien moral, autorisation événement, pancartes, police municipale, com ville
  - Pas de demande d'argent direct
- Contact assos partenaires (Surfrider, Mains de la Mer, MJC, scouts)
- Premier événement Parc de la Navale
- Communiqué presse coordonné (Var-Matin, France Bleu)

### Phase 3 — Expansion (S25+)
- Top 20 villes France
- Belgique, Suisse, Québec
- EU
- Monde

### Métriques de succès
- D1 retention : >40%
- D30 retention : >10%
- Conversion pass : 2-5%
- ARPU : 1-3 €/mois
- NPS : >50

---

## 9. Risques + mitigations

| Risque | Mitigation |
|---|---|
| Triche → perte crédibilité | IA + revue communautaire + trust score + bans rapides |
| Agressions IRL | KYC + spots publics + SOS + modération + mineurs sandboxés |
| RGPD violations | Hébergement EU + privacy by design + DPO + audit |
| Saturation marché | Différenciateur "preuve réelle" + classement géo + duels IRL |
| CAC trop élevé | Acquisition organique (TikTok, mairie, presse locale) |
| Coûts IA explosent | Gemini gratuit → Claude Haiku au scale, optimisations |
| Abandon | Streaks + saisons + compet hebdo + cercles d'amis |

---

## 10. Calendrier prévisionnel

### Cette semaine (S0)
- ☐ Compte Google Play (25 $)
- ☐ Compte Supabase, Expo, Google AI Studio (Gemini), RevenueCat, GitHub
- ☐ Réserver @luavio sur Instagram, TikTok, X, YouTube
- ☐ Landing page simple
- ☐ Premier post teaser réseaux
- ☐ Préparer dossier mairie 4 pages

### S1-S2
- Setup repo + projet Expo "Hello World" sur iPhone
- Setup Supabase schema (users, tasks, xp_logs, ranks)
- Design system (composants Lilita One + couleurs)

### S3-S6
- Auth + onboarding + Yoti KYC
- Tâches du jour + caméra + Gemini Flash vérif
- XP, niveaux, rangs

### S7-S10
- Classement top 10 multi-échelles
- Streak + récompenses quotidiennes
- QR code + scan + amis
- Compétition hebdo V1

### S11-S14
- Pass mensuel + Sparks (RevenueCat)
- Profil public + stats
- Compte Apple Dev + Apple Sign In
- TestFlight beta

### S15-S16
- Polish + bug fix + équilibrage XP
- Soumission App Store + Google Play
- Préparation événement La Seyne

### S17 — Lancement
- Mise en ligne stores
- RDV mairie acté
- Premier événement Parc de la Navale
- Communiqué presse

---

## 11. Fichiers du projet

| # | Fichier | Contenu |
|---|---|---|
| 01 | concurrence.md | Analyse Habitica, LifeUp, Lion XP, etc. |
| 02 | concept_optimise.md | Concept de base raffiné |
| 03 | monetisation.md | Sources de revenu détaillées |
| 04 | mecaniques.md | XP, rangs, classement, vérif IA |
| 05 | risques_ethique.md | Risques légaux, éthiques, business |
| 06 | etapes_pre_dev.md | Étapes avant code |
| 07 | questions.md | Premières questions à trancher |
| 08 | decisions_actees.md | Premières décisions (cible, ton, etc.) |
| 09 | direction_artistique.md | Options A/B/C |
| 10 | stack_tech.md | Stack technique détaillée |
| 11 | taches_safe.md | Pool de tâches V1 (~120) |
| 12 | actions_semaine.md | À faire en S0 |
| 13 | social_qr_carte.md | QR + radar + duels |
| 14 | merch_qr.md | T-shirts QR personnalisés |
| 15 | spots_defis_ecran.md | Spots IRL + détox écran |
| 16 | merch_spots_pub.md | Merch flow + déploiement spots |
| 17 | kyc_securite_mairie.md | Yoti + sécurité + stratégie mairie |
| 18 | mode_evenements.md | Mode Event admin |
| 19 | partenariats_assos_speech.md | Assos partenaires + speech maire |
| 20 | decisions_finales_checklist.md | Pré-décisions finales |
| 21 | comptes_dev_expliques.md | Apple/Google explication |
| 22 | RECAP_FINAL.md | Ce document |
| - | maquette.html | V1 sombre |
| - | maquette_v2.html | V2 jaune+violet (clair) |
| - | maquette_v3.html | V3 finale (Top 10 + rangs) |

---

## 12. Prochaine étape

**→ Plan de dev sprint par sprint.**

Si tout est validé ci-dessus, dans ma prochaine réponse je te livre :
1. Plan de dev complet (16 semaines, sprint par sprint)
2. Setup environnement de dev (étapes ultra précises)
3. Premier code (Sprint 0)

**Si quelque chose manque ou doit changer, dis-le maintenant.**
