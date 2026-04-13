# Retail Shop PWA — Figma Redesign + Supabase Migration

**Date:** 2026-04-13
**Status:** Approved
**Figma Source:** https://www.figma.com/make/BEFJJ4Fjtr4eZAxueCsHCi/Retail-Inventory-and-Sales-App

## Summary

Rebuild the retail-shop-pwa UI to match the Figma Make design, migrate the backend from Firebase to Supabase, and simplify from multi-tenant to single-user. The Figma design is the source of truth for all screens. One addition beyond the Figma: a lightweight "Record Sale" FAB + bottom sheet on the Dashboard.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Backend | Supabase (PostgreSQL) | Relational model fits retail data; simpler than Firebase |
| Auth | Supabase Auth (email/password + Google SSO) | Single platform; SSO is a dashboard toggle |
| User model | Single user, full access | No shops, roles, or staff management |
| UI source of truth | Figma Make design | 3 tabs: Dashboard, Sales Insights, Inventory |
| Missing sale-recording flow | FAB + bottom sheet on Dashboard | Lightweight — not a full POS screen |
| Build targets | PWA + Capacitor Android | Both preserved from current app |
| Migration approach | Incremental in existing repo | Preserve git history, Vite/Tailwind/Capacitor config |

## Auth Screens

### Login
- Blue-to-indigo gradient background
- Store icon + "Retail Manager" branding
- Email + password fields with icons (Mail, Lock from lucide-react)
- Show/hide password toggle
- "Forgot password?" link
- Sign In button
- Google SSO button ("Continue with Google") with divider
- "Don't have an account? Sign Up" link
- Supabase Auth: `signInWithPassword` + `signInWithOAuth({ provider: 'google' })`

### Signup
- Same gradient background
- Fields: Name, Shop Name, Email, Password, Confirm Password
- Shop Name stored in `profiles.shop_name` (display label, not multi-tenant)
- Supabase Auth: `signUp` + insert into `profiles` table

### Forgot Password
- Email input
- Supabase Auth: `resetPasswordForEmail`
- Success state: green checkmark + "Check your email" message
- "Back to Sign In" button

### Auth Architecture
- `AuthContext` wraps the app, provides `user` and `session`
- `ProtectedRoute` component redirects to `/login` if no session
- Sessions managed automatically by Supabase (JWT in localStorage)

## Core Screens

### Bottom Navigation
- 3 tabs: Dashboard, Sales, Inventory
- Icons from lucide-react: LayoutDashboard, TrendingUp, Package
- Animated active indicator with Framer Motion `layoutId` spring transition
- Fixed at bottom, safe-area-inset-bottom padding

### Dashboard
- **Header:** "Dashboard" + today's formatted date
- **Today's Performance:**
  - Revenue card (full width) — today's total sales, % change vs yesterday
  - Items Sold + Profit (2-col grid) — from today's sales
- **Month to Date:**
  - MTD Sales (full width) — current month total, % change vs last month same period
  - MTD Profit + Low Stock count (2-col grid)
- **Recent Transactions:** Last ~10 sales, product name, qty, time, amount
- **Record Sale FAB:** Bottom-right floating button, above nav
  - Opens bottom sheet with: searchable product dropdown, qty picker (+/-), auto-calculated total, "Complete Sale" button
  - On submit: insert into `sales`, decrement `products.current_stock`, show success toast
- **MetricCard component:** Icon + trend indicator (up/down %) with green/red coloring, animated entry via Framer Motion

### Sales Insights
- **Best Day This Week:** Gradient green card — queries sales grouped by day, picks highest profit. Shows day name + date, profit, total sales, items sold
- **Daily / Monthly toggle:** Pill-style segmented control
- **Sales chart:** BarChart (daily) or LineChart (monthly) via Recharts, blue fill
- **Profit chart:** Same toggle, green fill
- **Top Products:** List with product name, units sold, revenue, progress bar relative to top seller

### Inventory
- **Header:** "Inventory" + item count + blue "+" add button
- **Low stock alert:** Amber banner with count of items below threshold
- **Search:** Filters by product name or SKU
- **Product cards:** Name, SKU, price, low-stock badge, stock level with +/- buttons
  - +/- directly updates `products.current_stock` in Supabase
  - Low stock items get amber border + "Low" badge
- **Add Item modal:** Bottom sheet — product name, SKU, category (select), selling price, cost price (addition beyond Figma — needed for profit calculation), initial stock, low stock threshold
- **Empty state:** "No products found" when search has no matches

## Supabase Schema

### `profiles`
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  shop_name text,
  created_at timestamptz default now()
);
```

### `products`
```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sku text,
  price numeric not null,
  cost_price numeric not null default 0,
  current_stock integer not null default 0,
  low_stock_threshold integer not null default 10,
  category text,
  created_at timestamptz default now()
);
```

### `sales`
```sql
create table sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  product_name text not null,
  quantity integer not null,
  unit_price numeric not null,
  cost_price numeric not null,
  total_amount numeric not null,
  profit numeric not null,
  created_at timestamptz default now()
);
```

### Row-Level Security
All tables have RLS enabled. Each table gets SELECT/INSERT/UPDATE/DELETE policies:
```sql
-- profiles
alter table profiles enable row level security;
create policy "Users read own profile"
  on profiles for select using (id = auth.uid());
create policy "Users insert own profile"
  on profiles for insert with check (id = auth.uid());
create policy "Users update own profile"
  on profiles for update using (id = auth.uid());

-- products
alter table products enable row level security;
create policy "Users read own products"
  on products for select using (user_id = auth.uid());
create policy "Users insert own products"
  on products for insert with check (user_id = auth.uid());
create policy "Users update own products"
  on products for update using (user_id = auth.uid());
create policy "Users delete own products"
  on products for delete using (user_id = auth.uid());

-- sales
alter table sales enable row level security;
create policy "Users read own sales"
  on sales for select using (user_id = auth.uid());
create policy "Users insert own sales"
  on sales for insert with check (user_id = auth.uid());
create policy "Users delete own sales"
  on sales for delete using (user_id = auth.uid());
```

### Indexes
```sql
create index idx_products_user_id on products(user_id);
create index idx_sales_user_id on sales(user_id);
create index idx_sales_created_at on sales(created_at desc);
create index idx_sales_product_id on sales(product_id);
```

## Hooks (replaces Firebase hooks)

| Hook | Purpose | Supabase query |
|---|---|---|
| `useAuth` | Session state, user object | `supabase.auth.getSession()` + `onAuthStateChange` |
| `useProducts` | Product list, CRUD, real-time | `from('products').select()` + `.on('postgres_changes', ...)` |
| `useSales` | Sales list, create sale, real-time | `from('sales').select().order('created_at', { ascending: false })` |
| `useDashboardStats` | Today's revenue/profit/count, MTD, % changes, low stock count | Derived from products + sales data |

## File Structure

```
src/
  supabase/
    client.js            # createClient(url, anonKey)
    auth.js              # login, signup, resetPassword, googleSignIn, logout
    database.js          # CRUD for products & sales
  hooks/
    useAuth.js
    useProducts.js
    useSales.js
    useDashboardStats.js
  contexts/
    AuthContext.jsx
  screens/
    Login.jsx
    Signup.jsx
    ForgotPassword.jsx
    Dashboard.jsx
    SalesInsights.jsx
    Inventory.jsx
  components/
    layout/
      BottomNav.jsx
      Layout.jsx
    common/
      Toast.jsx
    dashboard/
      MetricCard.jsx
      RecentTransactions.jsx
      RecordSaleSheet.jsx
    sales/
      SalesChart.jsx
      TopProducts.jsx
    inventory/
      ProductCard.jsx
      AddItemModal.jsx
  App.jsx
  main.jsx
```

## Dependencies

### Add
- `@supabase/supabase-js` — database + auth
- `framer-motion` — animations
- `recharts` — charts
- `lucide-react` — icons

### Remove
- `firebase`
- `dexie`
- `dexie-react-hooks`

### Keep
- `react`, `react-dom`, `react-router-dom`
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`
- `tailwindcss`, `autoprefixer`, `postcss`, `@tailwindcss/forms`
- `vite`, `@vitejs/plugin-react`, `vite-plugin-pwa`, `workbox-window`

## Visual Design Tokens (from Figma)

- **Primary:** blue-600 (`#2563eb`)
- **Cards:** `bg-white rounded-2xl border border-gray-200 p-5`
- **Modals:** bottom sheet, `rounded-t-3xl`, spring animation
- **Auth background:** `bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800`
- **Success accent:** green-500 to emerald-600 gradient
- **Low stock:** amber-50 bg, amber-200 border, amber-600 text
- **Typography:** 2xl bold for screen titles, sm for labels, xs for secondary text
- **Animations:** Framer Motion — `initial={{ opacity: 0, y: 20 }}`, staggered list entries, spring-based tab indicator

## What's Dropped

- Firebase SDK (auth + firestore)
- Dexie local database
- Multi-tenant shop system (shop IDs, staff roles)
- Admin/Account screen
- Quick Sale dedicated screen (replaced by Dashboard FAB)
- Products screen (merged into Inventory)
- Monthly Insights day-by-day table (replaced by Sales Insights charts)
- `AppContext` (no longer needed)
- All Firebase-specific files (`src/firebase/*`, `firestore.rules`)

## Environment

```
VITE_SUPABASE_URL=https://lhtcmgfyfnulekeabmdq.supabase.co
VITE_SUPABASE_ANON_KEY=<stored in .env, not committed>
```
