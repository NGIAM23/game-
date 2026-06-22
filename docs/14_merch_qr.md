# Merch QR personnalisé

## Faisabilité
✅ **Possible et pas si complexe. Excellente idée business + viralité.**

## Concept
T-shirts / sweats / casquettes avec :
- QR code unique lié au compte du client
- Pseudo imprimé (sous le QR ou intégré au design)
- Scan → profil public du porteur
- Marketing porté = pub gratuite ambulante

---

## 2 architectures possibles

### Option A — QR statique unique (recommandée V1)

**Comment ça marche**
1. Client connecté commande un T-shirt
2. Backend génère URL permanente : `lavie.app/u/[user_id]` ou `lavie.app/u/[pseudo]`
3. QR encodé avec cette URL
4. Imprimé sur vêtement
5. Scan QR → ouvre `lavie.app/u/pseudo` → web (ou deeplink app si installée)
6. Page profil publique : pseudo, niveau, rang, stats, avatar, bouton "Ajouter" / "Voir dans l'app"

**Avantages**
- Simple, fiable, 0 maintenance
- Marche même si app pas installée (fallback web)
- T-shirt valable à vie (URL change pas)

**Inconvénient**
- Si user change de pseudo, URL doit suivre (utiliser user_id immuable derrière)

### Option B — QR dynamique (V2+, plus tard)

QR pointe vers `lavie.app/q/[token]` → backend redirige selon contexte (campagne, événement, etc.).
→ Inutile V1, complexité inutile.

→ **Reco : Option A en dur.**

---

## Workflow d'achat

### Dans l'app
1. Onglet "Boutique" → "Merch"
2. Choix produit (T-shirt noir/blanc, sweat, casquette)
3. Aperçu live :
   - QR généré automatiquement (lié à son compte)
   - Pseudo affiché en typo cohérente
   - Avatar 2D possible aussi
4. Choix taille
5. Paiement
6. Adresse livraison
7. Confirmation

### Côté backend
1. Création commande
2. Génération SVG/PNG du visuel final (QR + pseudo + design)
3. Envoi à fournisseur POD (Print on Demand)
4. Livraison directe au client

---

## Fournisseurs POD (Print on Demand)

**Pas besoin de stock, pas de logistique.** Tu sends le visuel, ils impriment + envoient.

| Fournisseur | Note | Marge | EU |
|---|---|---|---|
| **Printful** | Premium, bonne qualité, API solide | ~40-50% sur t-shirt 25 € | ✅ usine Espagne/Lettonie |
| **Printify** | Plus de choix, prix bas, qualité variable | 50-60% | ✅ |
| **Gelato** | Européen, écolo, qualité bonne | 40-50% | ✅ usine FR/EU |
| **Teemill** | Écolo bio coton, UK | 30-40% | ⚠️ UK = douanes |

→ **Reco : Printful** au début (qualité = image de marque). **Gelato** si tu veux écolo + 100% EU.

Tous ont des **APIs** → intégration automatique dans ton app, commande → impression sans intervention humaine.

---

## Pricing exemple

| Produit | Coût Printful | Prix vente | Ta marge |
|---|---|---|---|
| T-shirt basique | ~12 € | 29 € | ~17 € |
| T-shirt premium | ~18 € | 39 € | ~21 € |
| Sweat | ~28 € | 59 € | ~31 € |
| Casquette | ~14 € | 29 € | ~15 € |
| Tote bag | ~10 € | 22 € | ~12 € |

**Volume potentiel** : à 10k DAU + 1% conversion merch = 100 ventes × 17 € marge = **1700 €/commande/mois** sans bouger.

---

## Design produit

### Règles QR imprimé
- Taille mini : **5×5 cm** (sinon scan galère)
- **Contraste élevé** (noir sur fond clair, ou inverse)
- **Marge blanche autour** (quiet zone 4 modules)
- **Niveau correction H** (résiste mieux à plis, salissure)
- **Pas de zone de pliure** (couture)

### Emplacements possibles
- Dos haut (entre omoplates) — visibilité max
- Poitrine côté cœur — discret mais scannable
- Manche
- Bas du dos
- → multi-emplacements possible (gros QR dos + petit poitrine)

### Variantes de design
- **Minimaliste** : juste QR + pseudo en bas
- **Stat** : QR + "LVL 47 — Or II" + pseudo
- **Catégorie** : QR + icône stat dominante (💪 / 🧠 / ❤️)
- **Saison** : variantes été (couleurs vives), hiver (sombre)
- **Collab artistes** : drop limités, gen Z friendly

---

## Tech à coder

### Génération du visuel imprimable
- Lib : `qrcode` (Node.js) ou `qrcode.react`
- Génère QR + overlay (pseudo, logo) en SVG
- Convertit en PNG haute def (300 DPI minimum, idéalement 600)
- Push vers API Printful via `mockup-generator` puis création commande

### Intégration Printful
- API REST, doc claire
- SDK Node officiel
- Webhooks pour statut commande
- Sandbox mode pour test

### Stack ajoutée
- `node-printful` ou appels REST directs
- Stripe pour paiement (ou RevenueCat déjà choisi → étendre web)
- Page `lavie.app/u/[pseudo]` côté web (Next.js) pour les scans hors app

---

## Légal / pratique

- ⚠️ **Mineurs <16** : pas de profil public sur web depuis QR — fallback "Profil privé, scan depuis l'app uniquement (connexion ami)"
- TVA EU à gérer (Printful peut facturer pour toi via "Stripe Tax")
- CGV vente physique séparées
- Retours = règle 14 jours **sauf produit personnalisé** (mention obligatoire au checkout)
- Modération design : si user met pseudo offensant, refus auto + remboursement

---

## Idées poussées

### Capsule drops limités
- 100 exemplaires saison, numérotés
- Badge "Founder's Tee" dans l'app, permanent
- Crée FOMO + collection

### Évolutif
- Quand user passe rang Or → propose t-shirt "Or"
- Le t-shirt suit ta progression (couleur badge change)

### Cadeau onboarding gros levels
- Atteindre niveau 100 → goodies offerts (sticker QR, casquette)
- Coût marketing minime, fidélisation max

### B2B / entreprises
- Pack entreprise : t-shirts équipe avec QR
- Team building bien-être

### Sticker QR
- Pack 10 stickers = 5-10 €
- Coller partout (laptop, gourde, casque)
- Marketing viral pas cher

---

## Roadmap intégration

### V1 (MVP)
- ❌ Pas de merch (focus app core)

### V1.5 (mois 5-6, après MVP)
- ✅ Boutique merch dans app
- ✅ 3-4 produits Printful
- ✅ Page profil web (pour scans extérieurs)

### V2+
- ✅ Drops limités
- ✅ Stickers
- ✅ B2B teams
- ✅ Évènements physiques

---

## Verdict

**Excellente idée. À garder pour V1.5 (mois 5-6).**
- Marketing viral imbattable (chaque vêtement = panneau publicitaire ambulant)
- Marge confortable
- Aucun stock à gérer (POD)
- Différenciation visible IRL

→ Pas une priorité dev V1, mais à intégrer roadmap publique → argument levée fonds + pitch.
