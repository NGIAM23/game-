# Stack technique (gratuit max)

## Frontend mobile

**React Native + Expo (managed workflow)**
- 1 codebase iOS + Android
- Hot reload, OTA updates
- Beaucoup de tuto, IA (moi) excellent dessus
- Build cloud EAS gratuit (limité, suffit MVP)

Alternatives écartées :
- Flutter : bien aussi, mais Expo a meilleur écosystème JS
- Native iOS+Android : x2 le travail
- PWA : trop limité (caméra, push, perf)

## Backend / DB / Auth / Storage

**Supabase (free tier généreux)**
- Postgres managé
- Auth (email, Google, Apple sign-in inclus)
- Storage photos
- Realtime (chat, classements live)
- Edge Functions (serverless)
- 500 MB DB + 1 GB storage + 50k MAU gratuit
- Hébergé EU au choix (Frankfurt)
- ⚠️ Quand tu passes ce seuil = 25 $/mois (Pro), reste honnête longtemps

Alternatives écartées :
- Firebase : pas EU par défaut, vendor lock-in Google
- Self-hosted : trop de boulot maintenance
- Appwrite : moins mature

## Vérification IA images

**Phase 1 MVP — Gemini Flash gratuit**
- Free tier : 15 RPM, 1500 req/jour gratuit
- Suffisant pour beta 100-500 users
- Sortie : score JSON structuré

**Phase 2 traction — Claude Haiku 4.5 via API**
- ~0,001 €/image
- Plus fiable, meilleur français
- À activer quand revenus > coûts

**Détection AI-generated**
- Sightengine free tier (peu)
- Ou modèle local Hugging Face : `umm-maybe/AI-image-detector` gratuit

## Push notifs

**Expo Push** (gratuit, illimité)
→ ou OneSignal gratuit <10k users

## Analytics

**PostHog Cloud free** (1M events/mois gratuit, EU host)
→ funnel, rétention, A/B tests

## Crash reporting

**Sentry** free tier (5k events/mois)

## Paiements

**RevenueCat** (gratuit jusqu'à 2,5k $/mois revenus, ensuite 1%)
- Wrapper Apple/Google IAP simplifié
- Pass mensuel + packs sparks
- Plus Stripe pour web/B2B futur

## Mailing

**Resend** (3k emails/mois gratuit)
- transac auth, reset password
- digest hebdo

## Code repo

**GitHub gratuit privé**

## Stack en 1 ligne

> React Native + Expo + Supabase + Gemini Flash + RevenueCat + PostHog
> = **0 € jusqu'à ~10k users actifs**, ~50-100 €/mois ensuite

## Outils dev (moi en assistant)

- VS Code + Cursor (free tier) ou Claude Code
- Tu pair avec moi pour chaque feature
- Tu lances, je corrige

## Coût estimé MVP → 10k users

| Poste | Coût/mois |
|---|---|
| Supabase | 0 → 25 $ |
| Vercel (landing) | 0 |
| Domaine | 1 € |
| Apple Dev account | 8 €/mois (99 $/an) |
| Google Play | 25 $ one-shot |
| Expo EAS | 0 → 19 $ |
| IA Gemini | 0 → quelques $ |
| RevenueCat | 0 |
| PostHog | 0 |
| Sentry | 0 |
| **Total** | **~10 €/mois jusqu'à traction** |

→ MVP lançable avec **<200 € total** (domaine + Apple + Google) si on code tous les deux.
