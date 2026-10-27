# RetailDaddy

**Mobile-first retail operations: products, sales, stock, and daily visibility.**

A React application for small retail workflows, with a Supabase-backed product
catalogue, sales recording, inventory views, and sales insights. The interface
prioritises touch-friendly interactions and a small set of everyday shop tasks.

## Workflow

1. Sign in.
2. Add products and opening stock.
3. Record a sale against a product.
4. Review stock and dashboard or sales-insight views.

## Implementation

| Layer | Current implementation |
|---|---|
| Interface | React 19, React Router, Tailwind CSS, Framer Motion |
| Data and authentication | Supabase |
| Sales visualisation | Recharts |
| Build and PWA configuration | Vite 7 and `vite-plugin-pwa` |
| Android project | Capacitor project in `android/` |

**Inspect the work:** [screens](src/screens/), [data access](src/supabase/),
[workflow hooks](src/hooks/), and [Supabase schema/migrations](supabase/).

## Local setup

You need Node.js compatible with the project's Vite version, npm, and a Supabase
project. See [package.json](package.json) for the actual dependency versions.

```bash
git clone https://github.com/sgshaji/RetailDaddy.git
cd RetailDaddy
npm ci
```

Copy `.env.example` to `.env` and set your project's URL and public client key:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Apply the relevant SQL from [supabase/](supabase/) to your own project and review
its access policies before using real data. Then start the app:

```bash
npm run dev
```

`VITE_` variables are included in browser code. Never put a Supabase service-role
key or another server secret in them.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production frontend build |
| `npm run preview` | Preview the built frontend |
| `npm run lint` | Existing ESLint checks |

## Scope and verification

This is an application implementation, not a claim of production adoption or a
measured checkout-time improvement. Build, lint, browser workflows, and Android
packaging were not rerun for this documentation refresh.

The current data layer uses Supabase, not the IndexedDB/Dexie stack described in
the earlier README. PWA configuration does not establish offline transactional
support: verify connectivity behaviour, data isolation, stock consistency,
and recovery before relying on the application for shop operations.
