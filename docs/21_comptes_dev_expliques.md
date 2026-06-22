# Comptes développeur Apple + Google — explications

## C'est quoi exactement

Apple et Google ne laissent pas n'importe qui mettre une app sur leurs stores. Pour publier une app sur **App Store** (iPhone) ou **Google Play** (Android), il faut un **compte développeur officiel** chez chacun.

C'est juste un **abonnement administratif** qui te donne :
- Le droit de publier des apps
- Accès aux outils de build et test
- Accès aux ventes/revenus
- Accès au support technique

Sans ça → **tu ne peux pas publier**, point.

---

## Apple Developer Program

### Coût
**99 $ par an** (~92 €/an, payable mensuellement non, c'est annuel uniquement)

### Ce que ça inclut
- Publication sur l'App Store
- TestFlight (beta tests, jusqu'à 10 000 testeurs)
- Outils Xcode complets
- Push notifications
- In-App Purchases (achats intégrés, pass mensuel, sparks)
- Sign in with Apple
- Certificats signature (obligatoires pour installer sur iPhone)

### Ce qu'il faut pour s'inscrire
- Compte Apple ID
- Carte bancaire ou virement
- Pièce d'identité
- Adresse postale
- (Optionnel V1) Numéro SIREN si tu veux compte "Entreprise" — mais compte "Individuel" suffit au début

### Validation
- 1 à 7 jours, souvent 24-48h
- Apple peut demander pièce d'identité scannée

### Lien
https://developer.apple.com/programs/enroll/

---

## Google Play Console

### Coût
**25 $ one-shot** (~23 €), payés une seule fois, valable à vie

### Ce que ça inclut
- Publication sur Google Play
- Internal Testing / Closed Testing / Open Testing (équivalent TestFlight)
- Play Billing (achats intégrés Android)
- Outils analytics
- Push notifications via Firebase

### Ce qu'il faut pour s'inscrire
- Compte Google
- Carte bancaire
- Pièce d'identité
- Adresse

### Validation
- Quasi-instantanée

### Lien
https://play.google.com/console/signup

---

## Pourquoi maintenant et pas plus tard ?

1. **Validation Apple peut prendre 1 semaine** → autant lancer la procédure tout de suite, on ne pourra pas tester sur ton iPhone réel sans
2. **Permet TestFlight dès la fin du sprint 1** : tu installes l'app sur ton iPhone direct depuis TestFlight, plus pratique qu'Expo Go pour tester sérieusement
3. **Coût total = ~115 €** payé une fois (Google) + 92 €/an (Apple) → dérisoire vs le projet

---

## Compte Individuel vs Entreprise

| Critère | Individuel | Entreprise |
|---|---|---|
| Prix | 99 $/an Apple, 25 $ Google | 99 $/an Apple, 25 $ Google |
| Nom affiché store | Ton nom | Nom société |
| SIREN requis | Non | Oui |
| Délai validation | 1-7 jours | 1-4 semaines |
| Crédibilité | Moyenne | Forte |

→ **Reco V1 : Compte Individuel à ton nom**, tu passeras en Entreprise plus tard si tu crées une société (auto-entreprise, SASU, etc.).

→ **Évolution** : Apple permet le transfert d'apps d'un compte individuel à un compte entreprise plus tard, sans casser.

---

## Étapes concrètes pour toi cette semaine

### Apple (60 min)
1. Va sur https://developer.apple.com/programs/enroll/
2. Connecte-toi avec ton Apple ID
3. Choisis **Individuel**
4. Renseigne identité + adresse
5. Paie 99 $ (98,99 € environ)
6. Attente validation (notif email)

### Google (15 min)
1. Va sur https://play.google.com/console/signup
2. Connecte-toi avec ton compte Google
3. Renseigne identité
4. Paie 25 $ (~23 €)
5. Création instantanée

### Total
- ~110-115 €
- ~75 min de paperasse
- Une fois pour toutes (Google), à renouveler chaque année (Apple)

---

## Reportable si vraiment besoin

**Tu peux différer si** :
- Tu veux d'abord coder 2-3 sprints sur Android via Expo Go (gratuit, sans compte dev)
- Tu hésites encore sur le projet
- Budget vraiment serré ce mois

**Tu ne peux PAS différer si** :
- Tu veux tester sur ton iPhone réel (besoin Apple Dev)
- Tu veux lancer beta TestFlight
- Tu veux publier sur les stores

→ **Reco : commencer par Google maintenant (25 $), Apple dans 4-6 semaines** quand tu auras un build à tester sur iPhone réel.

---

## En attendant Apple

Pendant que tu attends validation Apple, tu peux :
- Coder l'app sur ton PC (Mac ou Windows ou Linux, OK avec React Native + Expo)
- Tester via **Expo Go** sur ton iPhone (app gratuite App Store) — pas besoin de compte dev pour ça
- Tester sur émulateur Android (Android Studio gratuit)

→ Donc **Apple n'est urgent que pour la phase TestFlight / publication**, on a 4-6 semaines devant nous.

---

## Récap décision

| Action | Quand | Coût |
|---|---|---|
| Google Play Console | Cette semaine | 25 $ |
| Expo Go sur ton iPhone | Cette semaine | 0 |
| Compte Apple Developer | Dans 4-6 semaines (sprint 5-6) | 99 $/an |

→ Démarre par Google + Expo Go. On verra Apple plus tard.
