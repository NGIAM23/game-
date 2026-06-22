# Spots de défi IRL (duel)

## Concept validé
- 2 joueurs s'inscrivent à un **spot** (parc, place, salle sport, etc.)
- Ils doivent **se rencontrer physiquement** au point précis
- Confirmation mutuelle (scan QR de l'autre = "on est là")
- Défi démarre → liste de **mini-missions rapides** à enchaîner
- Temps limité (15-30 min)
- Celui qui valide le plus de missions = **vainqueur**
- Vainqueur : boost XP × 2 pendant 1-2h
- Perdant : rien de plus (pas de pénalité = pas toxique)
- **Compteur victoires affiché sur profil public**

✅ **Excellent. À garder. Très différenciant.**

---

## Pourquoi c'est puissant

- **Social IRL forcé** → rencontre réelle, pas juste chat
- **Récompense émotion + jeu**, pas argent → pas de gambling
- **Pas toxique** : perdant ne perd rien
- **Identité sociale** : "Tu as combien de duels gagnés ?" → flex sur profil
- **Crée la communauté locale** : tu reconnais des joueurs du coin
- **Rétention massive** : "rdv demain 18h au parc ?"

---

## Mécanique précise

### 1. Découvrir un spot
- Carte avec spots officiels (parcs, parvis, terrains)
- Spots **créés par modération** au début (sécurité)
- Plus tard : community-suggested + validés
- Tag spot : "Sport", "Marche", "Mixte", "Calme"

### 2. Lancer un défi
- Tu choisis un spot
- Tu lances "duel ouvert" (15 min de fenêtre)
- Tu attends qu'un autre joueur accepte OU tu invites ami
- Filtre niveau ±5 (équité)

### 3. Acceptation
- Notif à joueurs autour OU friend list
- "X te défie au [spot]. Accepter ?"
- 5 min pour accepter

### 4. Rendez-vous
- Map précise du spot + photo de référence ("rejoignez-vous près de la fontaine")
- 10-15 min pour s'y rendre
- Une fois sur place : **scan QR de l'autre** = confirmation présence mutuelle
- Si l'un ne vient pas dans le délai → défi annulé, l'absent prend "no-show" (3 no-shows = blocage défis 24h)

### 5. Liste missions du spot
Générée selon type de spot. Exemples **parc** :
- 🏃 Faire 300m de course
- 🚯 Ramasser 1 déchet
- 🤸 10 pompes / squats (vidéo courte)
- 🌳 Photo d'un arbre + nom de l'espèce
- 🚶 Marcher 500m
- 💧 Boire de l'eau
- 🤳 Selfie avec partenaire de défi
- 🧘 30s respiration profonde

→ 10-15 missions, le premier à 5 gagne OU le plus en 20 min

### 6. Validation missions
- Photo/vidéo rapide
- IA valide en <30s (ou validation simplifiée pendant duel = trust + audit après)
- Compteur live des 2 joueurs visible

### 7. Fin du duel
- Vainqueur annoncé
- Boost XP ×2 actif 1-2h
- Compteur victoire +1 sur profil
- Possibilité de "Devenir amis" en 1 tap
- XP de base sur missions = gagné quand même

### 8. Anti-abus
- Cooldown : 1 duel/heure max par joueur
- Limite quotidienne : 5 duels
- Blocage si signalements

---

## Types de défis avancés (V2+)

- **Duels 2v2** (équipes 2 joueurs)
- **Duel à distance** (pas besoin de se rencontrer, V3) — mais moins social
- **Tournoi spot** (4-8 joueurs, élimination)
- **Roi du spot** : leaderboard du spot, qui a le plus de victoires → "King of Parc Monceau"

---

## Profil public — stats à afficher
- Niveau, rang
- Stats par catégorie (radar chart)
- Streak
- **Duels gagnés / total**
- Badges
- Tâches accomplies (count, opt-in)

---

## Risques + mitigations

### Sécurité physique
- ⚠️ Faire venir 2 inconnus à un point → risque (agression, vol, harcèlement)
- **Mitigations** :
  - Spots **publics fréquentés uniquement** (parcs, gares, places)
  - Bouton "Signaler / SOS" en duel, géoloc partagée à modération
  - <16 ans → duels **uniquement avec amis confirmés**, pas inconnus
  - Système de notation post-duel (sourire / drapeau)
  - 3 signalements = ban temporaire
  - Charte de bonne conduite acceptée avant 1er duel
  - Pas de duels nuit (22h-7h)

### Privacy
- Géoloc précise seulement pendant le duel (15-30 min)
- Effacée après
- Floutée à ±50m sinon

### No-shows / sabotage
- Tracker "fiabilité" sur profil
- 3 no-shows → blocage 24h
- Récompense fiabilité (badge ⭐)

### Triche
- IA vérif en différé après duel (random check 10%)
- Si triche détectée → victoire annulée rétroactivement, vainqueur réel récompensé

---

## Tech requise

- Géoloc GPS pendant duel
- Realtime (WebSocket / Supabase Realtime) pour score live
- Notif push pour invitations
- Module modération spot
- → +1-2 mois de dev sur le MVP

→ Reco : **V1.5 ou V2**, pas V1. Trop complexe pour MVP.

---

# Limitation temps d'écran — comment l'intégrer

## Le paradoxe que tu as identifié
- App veut rétention → temps d'écran élevé
- Mission "devenir meilleur" → moins d'écran
- → **Contradiction directe**

## Solution : LaVie ne se compte PAS dans le temps d'écran "mauvais"

### Catégorisation des apps
Sur iOS/Android, Screen Time donne le détail par app.

**"Apps consommatrices"** (temps à RÉDUIRE) :
- TikTok, Instagram, YouTube, Snap, Twitter/X, Facebook, Reddit
- Netflix, Twitch (selon usage)
- Jeux vidéo grand public

**"Apps neutres / utiles"** (pas compté) :
- Maps, Messages, Mail, banking, transport
- Apps santé, sport, méditation
- **LaVie elle-même**

### Tâches de limitation
- "Moins de 1h sur TikTok aujourd'hui" → capture Screen Time
- "Moins de 2h réseaux sociaux cumulés" → capture
- "Pas ouvert Instagram aujourd'hui" → capture
- "Coucher du téléphone à 22h" (mode focus actif)

### Récompenses augmentées
- Ces tâches valent **3-5× plus d'XP** que les autres (effort réel)
- Bonus cumulatif sur streak
- Stat "💎 Conscience numérique" séparée

### Tâche meta "Sans écran"
- "App fermée pendant 4h consécutives" → XP passif
- Mode : tu actives, l'app se met en sommeil
- Si tu l'ouvres avant la fin → XP perdu
- ✅ Cohérent : l'app récompense le fait de ne PAS l'utiliser

### Communication marketing
> "La seule app qui veut que tu l'utilises moins."

→ Argument unique inattaquable. Genère du buzz garanti.

## Le bon équilibre

| Activité | Souhaité |
|---|---|
| Ouvrir l'app | Court (validate tâche, scroll classement, 5-15 min) |
| Faire tâches | Long (en dehors de l'app, IRL) |
| Engagement social | Modéré (chat, duel) |
| Doomscroll | Zéro (pas de feed infini) |

→ App **utilitaire + ludique**, pas **chronophage**.
→ Pas de feed style TikTok à scroller.
→ Pas de notifs spammy.
→ Notifs : 1-3 par jour max, contextuelles.

## Métrique interne
- **Track : "temps app par tâche validée"**
- Si user passe 1h dans l'app pour 1 tâche → red flag (mauvais design)
- Idéal : 2-3 min app pour 1 tâche

→ Tu mesures la **qualité d'usage**, pas la durée.
→ Inverse total du modèle réseau social classique.

---

## Verdict

✅ Spots de défi IRL : excellente feature, V2.
✅ Limitation temps d'écran : feature signature, V1, communication marketing centrale.
✅ Profil affiche victoires duels.
✅ Concept "anti-addiction" assumé = unique selling point fort.
