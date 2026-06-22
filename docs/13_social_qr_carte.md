# Social IRL — QR + Carte joueurs

## 1. QR Code profil

### Faisabilité
✅ **Très facile, à inclure V1**

### Fonctionnement
- Settings → "Mon QR" → affiche QR plein écran
- Scanner intégré (bouton sur Home ou profil)
- Scan → ouvre profil de l'autre user (niveau, rang, stats, streak)
- Action : "Ajouter ami" / "Cercle" / "Défier"

### Bonus
- QR dynamique (change toutes 24h) → anti-screenshot/spam
- Stickers QR vendables physiquement (tee-shirt, autocollant) → marketing viral
- QR sur écran de verrouillage perso (widget)

### Tech
- Lib : `react-native-qrcode-svg` + `expo-camera` (scan)
- Coût : 0 €
- Temps dev : 1-2 jours

---

## 2. Carte joueurs autour (style Pokémon Go light)

### Faisabilité
✅ **Possible, mais avec contraintes fortes**

### Version réaliste V1/V2 (recommandée)

**Mode "Radar" — opt-in strict**

- L'user **active** "Visible sur radar" (off par défaut)
- Carte 2D (style Google Maps / Mapbox)
- Pin joueurs visibles autour (rayon 200m-2km)
- Sur pin : pseudo, niveau, rang
- Tap pin → profil + bouton "Saluer" / "Ajouter"
- Position **floutée** à ±50-100m (anti-stalking)
- Refresh toutes 1-5 min (pas live continu = batterie + privacy)

**Tâche en cours visible ?**
- ❌ Trop intrusif par défaut
- ✅ Option : "Partager tâche actuelle pendant 1h" (bouton manuel)
- → ex : tu cours, tu actives, les autres voient "🏃 Course en cours"
- Auto-désactive après la tâche

### Pourquoi pas "vraiment live" comme Pokémon Go ?

- **RGPD** : géoloc live = donnée sensible, consentement explicite + DPO + audit
- **Sécurité** : harcèlement, stalking, mineurs → catastrophe relationnelle/judiciaire
- **Batterie** : GPS continu vide téléphone en 3-4h
- **Coût serveur** : websockets + geoqueries live = $$$
- **Charge légale** : si quelqu'un est agressé après usage → responsabilité

→ **Solution = visible quand tu veux, où tu veux, jamais par défaut**

### Garde-fous obligatoires

- Off par défaut, opt-in explicite à l'inscription
- **<18 ans = jamais visible sur radar publique** (uniquement cercles privés)
- Position floutée 100m
- Bouton "Devenir invisible 24h" toujours accessible
- Blocage / signalement direct depuis pin
- Pas d'historique de localisation enregistré côté serveur
- Pas de notif "X joueur est à 50m de toi"
- Désactivation auto la nuit (22h-7h selon préférence)

---

## 3. Version 3D animée avec avatars

### Faisabilité
⚠️ **Possible mais lourd. Reco : V3 / V4, pas V1**

### Coûts & complexité

| Aspect | Estimation |
|---|---|
| Moteur 3D mobile | React Native + Three.js / Unity / Godot |
| Modélisation avatars | 5-15k € (artiste 3D) ou avatars génériques |
| Animations | RPM (Ready Player Me) gratuit, sinon custom |
| Perf mobile | Test sur low-end Android = casse-tête |
| Batterie | Vide en 30 min |
| Build time | 4-8 mois en + sur le projet |
| Talent requis | Dev 3D senior obligatoire |

### Alternative pragmatique

**V1 : Pas de 3D, mais avatars 2D stylés**
- Avatar 2D customisable (style Bitmoji / Memoji / Apple)
- Affiché partout (profil, classement, pin carte)
- Cosmétiques = $$ (chapeau, tee-shirt, accessoires)
- Lib gratuite : Ready Player Me 2D, DiceBear

**V2 : Pin carte = avatar 2D**
- Sur la carte radar, ton pin devient ton avatar 2D
- Effet visuel proche de la 3D, coût nul
- Animation simple (pulse, level-up éclat) en SVG/Lottie

**V3+ : Si traction et budget, vraie 3D**
- Avatars 3D via Ready Player Me (gratuit, intégrable)
- Map 3D type AR Pokémon Go
- Mode "AR caméra" → voir avatars autres joueurs autour en réalité augmentée
- → après 100k+ MAU et levée fonds

---

## 4. Idées dérivées intéressantes

### A. "Match IRL"
- Quand 2 users avec radar ON se croisent et restent à <50m pendant 5 min
- Notif optionnelle : "Tu as croisé @user_X. Saluer ?"
- Bonus XP partagé si les 2 acceptent
- → mécanique sociale forte sans danger (consentement réciproque)

### B. "Lieux de défi"
- Spots physiques : parcs, salles sport, biblio
- Géofence + bonus XP si tâche faite sur place
- Type "gym Pokémon Go" mais sans combat, juste boost XP
- Marques partenaires sponsorisent leurs lieux

### C. "Tag IRL"
- Quand tu scannes le QR de quelqu'un = "tag" mutuel
- Compteur "rencontres réelles" sur profil
- Badge "Sociable" à X rencontres
- Rang social distinct du niveau perso

### D. "Co-tâche"
- 2 users IRL scannent leurs QR + valident même tâche ensemble
- Ex : "Marche 5km ensemble" → XP boosté pour les 2
- Vérification croisée plus fiable que photo

### E. "Évènements géolocalisés"
- 1× par mois, ville organise rassemblement (parc, événement asso)
- Tous les présents = bonus XP + tâche commune
- Construction communauté locale

---

## 5. Recommandation finale phasing

### V1 (MVP, 3-4 mois)
- ✅ QR code profil + scan
- ✅ Avatar 2D customisable (Ready Player Me ou DiceBear)
- ❌ Pas de carte

### V2 (mois 6-9, après traction)
- ✅ Carte radar opt-in (pin avatars 2D)
- ✅ "Match IRL" (croisement)
- ✅ Tâche partagée 1h optionnel
- ✅ Co-tâche en duo

### V3 (mois 12+, si levée fonds)
- ✅ Lieux de défi géofencés + partenariats marques
- ✅ Évènements communautaires
- ✅ Avatar 3D + map 3D légère

### V4 (long terme)
- ✅ Mode AR caméra
- ✅ Vraie expérience Pokémon Go-like

---

## 6. Impact business

Cette feature **carte/QR** = différenciateur majeur :
- Aucun concurrent ne fait ça correctement
- Argument marketing fort ("rencontre IRL des gens qui s'améliorent")
- Engagement viral (scan QR = partage organique)
- Justifie B2B (entreprises : "trouve tes collègues actifs")
- Justifie pass premium (avatars premium, skin radar, etc.)

**Verdict : feature signature à mettre dans la roadmap publique dès le pitch.**
