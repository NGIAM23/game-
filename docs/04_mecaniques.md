# Mécaniques de jeu détaillées

## Système XP / Niveaux

### Courbe d'XP
- Formule type : `XP_niveau_N = 100 × N^1.5`
- Niveau 1→2 : 100 XP
- Niveau 10→11 : ~3 162 XP
- Niveau 100→101 : ~100 000 XP
- Quasi-infini : niveau 1 à 9999

### Calcul XP d'une tâche
```
XP_base = difficulté × catégorie_multi × rareté
+ bonus_streak (× 1.0 à 2.0)
+ bonus_pass (× 1.1 si abonné)
+ bonus_courbe_active (× 1.0 à 1.3, voir système courbe)
+ bonus_première_fois (× 1.5)
+ bonus_compétition (× 2 le jour de compet)
```

Tâches par difficulté :
- Facile (1-5 min) : 10-30 XP — ramasser déchet
- Moyenne (15-30 min) : 50-150 XP — séance sport
- Difficile (1-3h) : 200-500 XP — finir gros projet
- Épique (multi-jours) : 1000-10000 XP — quête vie

## Rangs (visuel + statut social)

Inspiré jeux compétitifs :
- Initié (lvl 1-10)
- Apprenti (11-25)
- Bronze (26-50)
- Argent (51-100)
- Or (101-200)
- Platine (201-400)
- Diamant (401-700)
- Maître (701-1000)
- Grand Maître (1001-1500)
- Légende (1500+)

→ icône, couleur, animation montée

## Classement

### Échelles
- 🌍 Mondial
- 🇫🇷 National
- 🏙️ Ville (basé GPS opt-in)
- 👥 Cercle / amis
- 🏢 Entreprise (B2B)

### Périodicité
- Live (top all-time)
- Saison mensuelle (reset XP saison, garde niveau)
- Semaine de compétition (voir + bas)

## Compétition hebdomadaire — "La Course du Dimanche"

- 24h, dimanche 9h → lundi 9h (configurable par fuseau)
- XP doublé sur toutes les tâches ce jour-là
- Classement séparé compet
- **Récompenses Top monde** :
  - Top 1 : 500 € + objet partenaire + titre légendaire
  - Top 2-3 : 100 € équivalent
  - Top 10 : 1 mois pass gratuit + cosmétique exclu
  - Top 100 : sparks
  - Top 1000 : badge saison
- **Classement local** : top 1 ville → badge + sparks
- → événement à anticiper toute la semaine = rétention massive

## Tâches quotidiennes

### Pool
- 3 tâches quotidiennes obligatoires (gratuit)
- 2 tâches bonus (pass)
- Re-roll : 1 gratuit / 5 avec pass / via sparks

### Variété
- Mix catégories quotidiennement
- Adaptation niveau utilisateur (sport "1 séance" → "5 séances/sem")
- Saisonnalité (Noël, été, événements actu)

### Tâches hebdo
- 5 tâches plus exigeantes, +XP gros
- Reset lundi

## Streaks

- Compteur jours consécutifs avec ≥1 tâche
- Bonus XP progressif (max +50% à 30 jours)
- Streak freeze : 1 gratuit/mois, achetable
- Affiché publiquement → fierté + pression sociale saine

## Vérification IA — détails techniques

### Pipeline
1. User prend photo/vidéo IN-APP (pas depuis galerie → anti-fraude basique)
2. EXIF check (timestamp, géoloc cohérent)
3. **Détection AI-generated** (Sightengine, Hive, ou modèle propre)
4. **Multimodal LLM** (Claude/GPT-4V/Gemini Flash) :
   - prompt : "Cette image montre-t-elle [tâche] ? Réponds avec score 0-100 + justification"
5. Si score > 80 → validé auto
6. Si 50-80 → revue communautaire (3 users niveau ≥ X valident → +XP pour eux aussi)
7. Si <50 → rejeté, possibilité d'appel

### Anti-triche
- Photos avec watermark dynamique (timestamp + ID user invisible)
- Hash de l'image stocké → détection réutilisation
- Geofencing pour tâches localisées (salle de sport, magasin)
- Détection visages : si même setup répété → flag
- **Trust score** par user → bons users = vérif plus rapide, mauvais users = scrutin +

### Coûts API IA
- Claude/GPT-4V Mini ≈ 0,001-0,005 € par image
- À 100k DAU × 3 tâches × 0,003 € = 900 €/jour = 27k €/mois
- → couvert par pass + sparks
- Optimisations : modèle léger en premier filtre, multimodal en second

## Système de "courbe" (favorise usage quotidien)

- Graphique 30 jours de XP gagné
- Coefficient = moyenne 7 derniers jours / max historique
- Bonus XP × (1 + coefficient × 0.3)
- → user régulier = +30% XP en plus, user sporadique = base
- Affichage visuel hyper satisfaisant

## Chat & social

### Chat global (modéré)
- Désactivable
- Filtre IA en temps réel (insultes, spam, NSFW)
- Niveau min pour parler (lvl 5)
- Signalement → action en <24h
- **Mode lecture seule pour mineurs <16 ans** + chat amis only

### Cercles (groupes 5-20)
- Privés sur invit
- Chat dédié
- Défis de groupe
- XP collectif déblocable

### Profil public
- Niveau, rang, badges, streak, stats
- Galerie tâches accomplies (opt-in)
- Followers / following (façon Strava)

## Rétention — leviers clés

1. Streaks (peur de perdre)
2. Compétition dominicale (rendez-vous)
3. Pass mensuel (sunk cost)
4. Cercles d'amis (social pressure positive)
5. Récompenses quotidiennes (FOMO)
6. Mentor IA proactive (notification utile)
7. Saisons mensuelles (renouvellement)

## Onboarding

- Quiz de 10 questions → définit profil + tâches initiales adaptées
- Première tâche ultra-facile (ranger un objet, prendre photo) → win rapide
- Tuto en 3 étapes max
- Premier niveau atteint en <10 min d'usage
