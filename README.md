# FaceUp Analytics Dashboard

Dashboard SaaS unifiant les données first-party Supabase (économie, utilisateurs,
abonnements, parties) et les données comportementales PostHog (heatmaps, funnels,
consentement ATT) pour le jeu FaceUp (Blackjack).

## Stack

- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **TanStack Query** pour le fetching/caching des données
- **Recharts** pour les graphiques
- **React Router** pour la navigation entre sections
- **@supabase/supabase-js** en lecture seule
- **posthog-js** (capture) + **PostHog Query API / HogQL** (lecture)

## Démarrage

```bash
npm install
cp .env.example .env.local   # renseigner vos clés Supabase / PostHog
npm run dev
```

## Architecture

```
src/
  lib/
    supabase/
      client.ts        # client Supabase en lecture seule (anon key, pas de session)
      types.ts          # types Database — à régénérer avec `supabase gen types`
      queries/           # une fonction par domaine, tables/colonnes centralisées ici
        users.ts          # comptage utilisateurs + segmentation tracking
        subscriptions.ts  # churn, raisons de résiliation
        economy.ts         # flux coins/gems, impact des pubs sur la rétention
        games.ts            # cross-check "quitte après un all-in perdu"
    posthog/
      client.ts        # init posthog-js (capture côté client)
      queryApi.ts        # wrapper HogQL générique (voir sécurité ci-dessous)
      queries.ts          # requêtes HogQL typées : ATT, heatmap boutons, funnels
    utils.ts            # cn(), formatNumber(), formatPct()
  types/domain.ts       # types métier partagés par les hooks/composants
  context/
    TrackingSegmentContext.tsx  # filtre global Tous / Trackés / Anonymes
  hooks/                 # hooks React Query, un fichier par section de dashboard
  components/
    layout/               # Sidebar, Topbar, DashboardLayout
    ui/                    # Card, StatCard, SegmentToggle, EmptyState (primitives)
    dashboard/            # OverviewSection, BehaviorSection, EconomySection
  pages/                  # une page = un layout + une section, montée par route
```

Chaque section du dashboard (`components/dashboard/*Section.tsx`) est autonome :
elle consomme ses propres hooks, gère ses propres états de chargement/erreur, et
peut être déplacée vers une autre page sans dépendance cachée.

## Sections livrées

**Joueurs**
1. **Vue d'ensemble** (`/`) — inscrits, actifs/inactifs, gratuits/premium (Supabase),
   durée moyenne de session (PostHog), derniers utilisateurs inscrits (avec avatar).
2. **Comportement & Funnels** (`/behavior`) — consentement ATT, boutons les plus
   cliqués (autocapture), funnels de fuite après un événement de jeu (all-in perdu,
   défaites consécutives) jusqu'à la suppression de compte.
3. **Gameplay & Compétence** (`/gameplay`) — précision de stratégie de base
   (`game_stats.correct_decisions/total_decisions`), taux de victoire/bust/blackjack
   par mode de jeu.
4. **Progression & Rétention** (`/retention`) — rétention par cohorte d'inscription
   (D1/D7/D30, proxy `last_active_at`), distribution des niveaux, des streaks
   quotidiens, progression Battle Pass de la saison active.

**Business**
5. **Économie & Monétisation** (`/economy`) — flux coins/gems, impact des pubs
   visionnées sur la rétention D7, churn des abonnements et raisons de résiliation,
   répartition des achats gemmes par type d'objet, conversion Premium par cohorte,
   top 10 des "whales" (plus gros dépensiers).
6. **Croissance & Parrainage** (`/growth`) — funnel de parrainage (parraineurs actifs,
   filleuls, conversion Premium des filleuls), participation aux classements
   hebdomadaires (streak Classic, XP).

**Opérations**
7. **Trust & Safety** (`/trust-safety`) — volume de signalements et blocages (30j),
   principales raisons de signalement.
8. **Live Ops** (`/live-ops`) — parties solo en cours, tables entre amis par statut,
   taux d'acceptation des invitations.

Le sélecteur **Tous / Trackés / Anonymes** dans la barre supérieure segmente toutes
les requêtes Supabase via `users.privacy_settings->>dataCollection` (pas de colonne
ATT dédiée dans le schéma actuel — voir ci-dessous). Les sections PostHog ne
couvrent par construction que les utilisateurs trackés.

## Design

Le thème (fond noir, `#111214` pour les cartes, bordures blanches à 10 %, police
Inter, accents `#B79CFF`/`#8CCBFF`/`#B5F3C7`/`#F8CA5A`) est repris tel quel de
`client/src/index.css` dans `faceup-server`, l'app de jeu — dashboard interne, donc
volontairement dark-only (pas de variante claire).

Les avatars (`public/avatars/*.png`, copiés de `attached_assets/avatars3d/` dans
`faceup-server`) sont résolus depuis `users.selected_avatar_id` via
`src/lib/avatars.ts`, un port direct de `shared/avatarCatalog.ts` +
`client/src/data/avatars.ts` (mêmes ids, noms, catégories). Si l'app ajoute/renomme
des avatars, resynchronisez ce fichier et le dossier `public/avatars/` à la main.

## Schéma Supabase réel

`src/lib/supabase/types.ts` est calé sur `shared/schema.ts` (Drizzle) de
`faceup-server` — pas un schéma supposé. Points notables qui s'écartent d'un CRM
classique :

- **Pas de table `subscriptions` séparée** : `membership_type`,
  `subscription_expires_at`, `subscription_cancel_at_period_end`,
  `subscription_cancel_reason` sont des colonnes sur `users`
  (`src/lib/supabase/queries/subscriptions.ts`).
- **Coins n'ont pas de ledger** : `users.coins` n'est qu'un solde courant. Le flux
  "30 derniers jours" n'existe que pour les gems (`gem_transactions`, un vrai
  ledger signé) — pour les coins, `economy.ts` remonte le stock total en
  circulation, pas un flux.
- **Pas de table de sessions de jeu / vues de pub** : les funnels précis
  (all-in perdu → quitte l'app → supprime son compte, pubs regardées) vivent dans
  PostHog (`src/lib/posthog/queries.ts`), pas Supabase. Le seul proxy Supabase est
  `users.all_in_lose_streak` (`src/lib/supabase/queries/games.ts`).

Si le schéma évolue, éditez `src/lib/supabase/types.ts` à la main (ou régénérez-le
si vous avez un accès CLI Supabase) :

```bash
npx supabase gen types typescript --project-id <project-ref> > src/lib/supabase/types.ts
```

### Lecture seule — configuration recommandée

- Utilisez la clé `anon`, jamais `service_role`.
- Restreignez l'accès à `SELECT` uniquement via des policies RLS dédiées au rôle
  utilisé par le dashboard (créez un rôle Postgres `analytics_readonly` si besoin).

## Événements PostHog attendus

Voir `POSTHOG_EVENTS` dans `src/lib/posthog/queries.ts` : `att_consent_response`,
`game_all_in_loss`, `game_consecutive_loss`, `session_start`, `account_deleted`.
Ajustez ces noms à ceux réellement envoyés par l'app mobile/web.

## Sécuriser l'appel à la PostHog Query API

`src/lib/posthog/queryApi.ts` appelle directement `POST /api/projects/:id/query/`
avec une **clé API personnelle**, ce qui l'expose dans le bundle client. Correct
pour un prototype local derrière votre propre auth, à proscrire en production :
remplacez `postHogFetch` par un appel à une route backend (ex. `/api/posthog-query`)
qui détient la clé côté serveur et relaie la requête HogQL — le reste du code
(hooks, composants) n'a pas besoin de changer.

## Commandes

```bash
npm run dev       # serveur de développement
npm run build     # type-check + build de production
npm run preview   # prévisualiser le build
```
