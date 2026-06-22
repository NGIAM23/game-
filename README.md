# luavio

Monorepo : app mobile (Expo) + site web (Next.js) + logique partagée.

```
apps/
  mobile/   # React Native + Expo Router
  web/      # Next.js (landing, déployable sur ton domaine OVH)
packages/
  shared/   # design tokens, catégories XP, calcul niveaux/rangs, pool de tâches
docs/       # docs de specs/decisions du projet
```

## Démarrer en local

```bash
npm install

# Web (landing)
npm run dev:web        # http://localhost:3000

# Mobile (besoin de l'app Expo Go sur ton téléphone)
npm run dev:mobile
```

## Déploiement web sur ton domaine OVH

Le plus simple : déployer `apps/web` sur Vercel (gratuit, cf docs/10_stack_tech.md), puis pointer ton domaine OVH vers Vercel via les DNS (CNAME). Je peux te guider étape par étape quand tu es prêt à mettre en ligne.

Pas encore de backend (Supabase) connecté — les données sont mockées dans le code pour l'instant.
