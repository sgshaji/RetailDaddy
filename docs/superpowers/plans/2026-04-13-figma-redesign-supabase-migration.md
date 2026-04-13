# Retail Manager — Figma Redesign + Supabase Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the retail-shop-pwa with the Figma Make design and migrate from Firebase to Supabase.

**Architecture:** Incremental migration in the existing repo. Swap Firebase for Supabase (auth + PostgreSQL), replace all screens with the Figma design (3 tabs: Dashboard, Sales Insights, Inventory), add Framer Motion animations and Recharts charts. Single-user auth, no roles.

**Tech Stack:** React 19, Vite, Tailwind 3, Supabase (auth + DB), Framer Motion, Recharts, Lucide React, Capacitor (Android), PWA

**Spec:** `docs/superpowers/specs/2026-04-13-figma-redesign-supabase-migration.md`

**Figma Source:** https://www.figma.com/make/BEFJJ4Fjtr4eZAxueCsHCi/Retail-Inventory-and-Sales-App

**Supabase Project:** `https://lhtcmgfyfnulekeabmdq.supabase.co`

---

## File Map

### Create
- `src/supabase/client.js` — Supabase client singleton
- `src/supabase/auth.js` — Auth functions (login, signup, google, reset, logout)
- `src/supabase/database.js` — CRUD for products and sales
- `src/hooks/useAuth.js` — Session/user state hook
- `src/hooks/useProducts.js` — Products with real-time subscription
- `src/hooks/useSales.js` — Sales with real-time subscription
- `src/hooks/useDashboardStats.js` — Aggregated dashboard metrics
- `src/contexts/AuthContext.jsx` — Auth provider (replaces existing)
- `src/screens/Login.jsx` — Figma login (replaces existing)
- `src/screens/Signup.jsx` — Figma signup (replaces existing)
- `src/screens/ForgotPassword.jsx` — Figma forgot password (new)
- `src/screens/Dashboard.jsx` — Figma dashboard (replaces existing)
- `src/screens/SalesInsights.jsx` — Figma sales insights (new)
- `src/screens/Inventory.jsx` — Figma inventory (replaces existing)
- `src/components/layout/BottomNav.jsx` — 3-tab nav (replaces existing)
- `src/components/layout/Layout.jsx` — Minimal layout wrapper (replaces existing)
- `src/components/common/Toast.jsx` — Keep existing, works well
- `src/components/dashboard/MetricCard.jsx` — Animated stat card
- `src/components/dashboard/RecentTransactions.jsx` — Transaction list
- `src/components/dashboard/RecordSaleSheet.jsx` — FAB + bottom sheet
- `src/components/sales/SalesChart.jsx` — Recharts bar/line chart
- `src/components/sales/TopProducts.jsx` — Top products list
- `src/components/inventory/ProductCard.jsx` — Product card with +/-
- `src/components/inventory/AddItemModal.jsx` — Bottom sheet form
- `supabase/migrations/001_initial_schema.sql` — Schema + RLS

### Modify
- `.env` — Replace Firebase vars with Supabase vars
- `package.json` — Swap dependencies
- `tailwind.config.js` — Blue-600 primary palette
- `src/index.css` — Update CSS utilities
- `index.html` — Update branding from CounterBook to Retail Manager
- `vite.config.js` — Update PWA manifest
- `src/App.jsx` — New routes + providers
- `src/main.jsx` — No change expected

### Delete
- `src/firebase/` — Entire directory (config.js, auth.js, firestore.js)
- `src/db/` — Entire directory (schema.js, db.js, migrate.js)
- `src/contexts/AppContext.jsx` — No longer needed
- `src/screens/QuickSale.jsx` — Replaced by RecordSaleSheet
- `src/screens/Products.jsx` — Merged into Inventory
- `src/screens/Admin.jsx` — Dropped (no multi-user)
- `src/screens/Insights.jsx` — Replaced by SalesInsights
- `src/components/auth/ProtectedRoute.jsx` — Rebuilt into AuthContext
- `src/components/dashboard/QuickStats.jsx` — Replaced by MetricCard
- `src/components/dashboard/TopProducts.jsx` — Rebuilt in sales/
- `src/components/sales/ProductSelector.jsx` — Replaced by RecordSaleSheet
- `src/components/products/ProductForm.jsx` — Replaced by AddItemModal
- `src/components/common/Button.jsx` — Not needed (inline Tailwind)
- `src/components/common/Card.jsx` — Not needed (inline Tailwind)
- `src/components/common/Input.jsx` — Not needed (inline Tailwind)
- `src/components/common/Modal.jsx` — Replaced by Framer Motion sheets
- `src/components/common/Skeleton.jsx` — Not needed
- `src/components/layout/TopBar.jsx` — Removed (no top bar in Figma)
- `src/hooks/useDailySummary.js` — Replaced
- `src/hooks/useInventory.js` — Merged into useProducts
- `src/hooks/useProducts.js` — Replaced
- `src/hooks/useSales.js` — Replaced
- `src/utils/dateHelpers.js` — Not needed
- `firestore.rules` — Firebase artifact

---

## Task 1: Dependencies and Configuration

**Files:**
- Modify: `package.json`
- Modify: `.env`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`
- Modify: `index.html`
- Modify: `vite.config.js`

- [ ] **Step 1: Install new dependencies**

```bash
cd "c:\Users\ssivaraman\Project-Repos\[Personal] Experiments And PoCs\retail-shop-pwa"
npm install @supabase/supabase-js framer-motion recharts lucide-react
```

- [ ] **Step 2: Remove old dependencies**

```bash
npm uninstall firebase dexie dexie-react-hooks
```

- [ ] **Step 3: Create `.env` with Supabase credentials**

Write `.env` with your Supabase project URL and anon key (from Supabase Dashboard > Settings > API):
```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

- [ ] **Step 4: Update `tailwind.config.js`** — Change primary palette from green to blue-600

Replace the `colors.primary` object:
```js
primary: {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
},
```

- [ ] **Step 5: Update `src/index.css`** — Replace body background and update component styles to match Figma's `bg-gray-50`

Replace `background-color: #f8f9fb;` with `background-color: #f9fafb;` (Tailwind gray-50).

Remove the `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.input-large`, `.card-mobile` component classes (no longer used — Figma design uses inline Tailwind classes).

Keep: `.safe-area-pb`, `.safe-area-pt`, `.no-select`, `.scrollbar-hide`, `.skeleton`, `.animate-slideDown`, `.animate-fadeIn`, `.animate-scaleIn`.

- [ ] **Step 6: Update `index.html`** — Rebrand to Retail Manager

Change:
- `<meta name="theme-color" content="#059669" />` to `content="#2563eb"`
- `<meta name="description" ...>` to `"Track inventory and sales for your retail shop"`
- `<meta name="apple-mobile-web-app-title" content="CounterBook" />` to `"Retail Manager"`
- `<title>CounterBook</title>` to `<title>Retail Manager</title>`

- [ ] **Step 7: Update `vite.config.js` PWA manifest**

Update the manifest object:
- `name`: `'Retail Manager'`
- `short_name`: `'Retail Manager'`
- `description`: `'Track inventory and sales for your retail shop'`
- `theme_color`: `'#2563eb'`

Remove the `shortcuts` array (no Quick Sale shortcut).

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite starts without errors (app will be broken but server compiles).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json .env tailwind.config.js src/index.css index.html vite.config.js
git commit -m "chore: swap Firebase for Supabase deps, update config to blue palette"
```

Note: `.env` is in `.gitignore` so won't be committed — that's correct.

---

## Task 2: Supabase Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Profiles table
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  shop_name text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users read own profile"
  on profiles for select using (id = auth.uid());
create policy "Users insert own profile"
  on profiles for insert with check (id = auth.uid());
create policy "Users update own profile"
  on profiles for update using (id = auth.uid());

-- Products table
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

alter table products enable row level security;

create policy "Users read own products"
  on products for select using (user_id = auth.uid());
create policy "Users insert own products"
  on products for insert with check (user_id = auth.uid());
create policy "Users update own products"
  on products for update using (user_id = auth.uid());
create policy "Users delete own products"
  on products for delete using (user_id = auth.uid());

create index idx_products_user_id on products(user_id);

-- Sales table
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

alter table sales enable row level security;

create policy "Users read own sales"
  on sales for select using (user_id = auth.uid());
create policy "Users insert own sales"
  on sales for insert with check (user_id = auth.uid());
create policy "Users delete own sales"
  on sales for delete using (user_id = auth.uid());

create index idx_sales_user_id on sales(user_id);
create index idx_sales_created_at on sales(created_at desc);
create index idx_sales_product_id on sales(product_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

- [ ] **Step 2: Run the migration against Supabase**

Go to Supabase Dashboard > SQL Editor, paste the contents of `001_initial_schema.sql`, and click "Run". Or use the Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref lhtcmgfyfnulekeabmdq
npx supabase db push
```

Verify: In the Supabase dashboard, Table Editor should show `profiles`, `products`, `sales` tables.

- [ ] **Step 3: Enable Realtime for products and sales**

In Supabase Dashboard > Database > Replication, enable realtime for `products` and `sales` tables.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase schema migration with RLS policies"
```

---

## Task 3: Supabase Client + Auth Functions

**Files:**
- Create: `src/supabase/client.js`
- Create: `src/supabase/auth.js`

- [ ] **Step 1: Create Supabase client**

Create `src/supabase/client.js`:

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Create auth functions**

Create `src/supabase/auth.js`:

```js
import { supabase } from './client';

export async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email, password, metadata) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata, // { name, shop_name }
    },
  });
  if (error) throw error;

  // Update profile with name and shop_name
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ name: metadata.name, shop_name: metadata.shop_name })
      .eq('id', data.user.id);
  }

  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/supabase/
git commit -m "feat: add Supabase client and auth functions"
```

---

## Task 4: AuthContext + App Shell

**Files:**
- Create: `src/contexts/AuthContext.jsx` (replace existing)
- Modify: `src/App.jsx`
- Modify: `src/main.jsx` (verify no changes needed)

- [ ] **Step 1: Create AuthContext**

Replace `src/contexts/AuthContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

- [ ] **Step 2: Rewrite `src/App.jsx`** with new routes and auth guard

```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Dashboard } from './screens/Dashboard';
import { SalesInsights } from './screens/SalesInsights';
import { Inventory } from './screens/Inventory';
import { Login } from './screens/Login';
import { Signup } from './screens/Signup';
import { ForgotPassword } from './screens/ForgotPassword';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute><SalesInsights /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

- [ ] **Step 3: Commit**

```bash
git add src/contexts/AuthContext.jsx src/App.jsx
git commit -m "feat: add Supabase AuthContext and rewrite App routes"
```

---

## Task 5: Auth Screens (Login, Signup, ForgotPassword)

**Files:**
- Create: `src/screens/Login.jsx` (replace existing)
- Create: `src/screens/Signup.jsx` (replace existing)
- Create: `src/screens/ForgotPassword.jsx` (new)

- [ ] **Step 1: Create Login screen**

Replace `src/screens/Login.jsx` — matches Figma design with gradient background, Store icon, email/password fields with lucide icons, Google SSO button, Framer Motion entrance animation.

```jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginWithEmail, signInWithGoogle } from '../supabase/auth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Store className="w-8 h-8 text-blue-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Retail Manager</h1>
          <p className="text-blue-100">Track inventory and sales</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back</h2>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Link
              to="/forgot-password"
              className="block text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot password?
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full py-3 flex items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Create Signup screen**

Replace `src/screens/Signup.jsx` — matches Figma with Name, Shop Name, Email, Password, Confirm Password fields.

```jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Mail, Lock, Eye, EyeOff, User, Building2 } from 'lucide-react';
import { signUpWithEmail } from '../supabase/auth';

export function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(formData.email.trim(), formData.password, {
        name: formData.name,
        shop_name: formData.shopName,
      });
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Store className="w-8 h-8 text-blue-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Retail Manager</h1>
          <p className="text-blue-100">Create your account</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign Up</h2>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={formData.name} onChange={update('name')} placeholder="Enter your name" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={formData.shopName} onChange={update('shopName')} placeholder="Enter shop name" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={formData.email} onChange={update('email')} placeholder="you@example.com" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={update('password')} placeholder="Create a password" className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={update('confirmPassword')} placeholder="Confirm your password" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors active:scale-[0.98] disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 3: Create ForgotPassword screen**

Create `src/screens/ForgotPassword.jsx`:

```jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { resetPassword } from '../supabase/auth';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-5">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h2>
            <p className="text-gray-600 mb-6">
              We've sent password reset instructions to <span className="font-medium">{email}</span>
            </p>
            <Link to="/login" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center">
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Store className="w-8 h-8 text-blue-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Retail Manager</h1>
          <p className="text-blue-100">Reset your password</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
          <p className="text-gray-600 mb-6">Enter your email and we'll send you instructions to reset your password</p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors active:scale-[0.98] disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 4: Verify auth screens render**

```bash
npm run dev
```

Open `http://localhost:5173/login`. Verify the gradient login screen renders with the Figma design. Navigate to `/signup` and `/forgot-password`.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Login.jsx src/screens/Signup.jsx src/screens/ForgotPassword.jsx
git commit -m "feat: add Figma-styled auth screens with Supabase auth"
```

---

## Task 6: Layout + Bottom Navigation

**Files:**
- Create: `src/components/layout/Layout.jsx` (replace existing)
- Create: `src/components/layout/BottomNav.jsx` (replace existing)

- [ ] **Step 1: Create BottomNav**

Replace `src/components/layout/BottomNav.jsx`:

```jsx
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sales', id: 'sales', label: 'Sales', icon: TrendingUp },
  { path: '/inventory', id: 'inventory', label: 'Inventory', icon: Package },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-40">
      <div className="flex items-center justify-around px-2 pt-2 pb-6 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className="flex flex-col items-center justify-center gap-1 py-2 px-6 relative no-select"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-50 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-xs font-medium relative z-10 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Layout wrapper**

Replace `src/components/layout/Layout.jsx`:

```jsx
import { BottomNav } from './BottomNav';

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add Figma-styled Layout and 3-tab BottomNav"
```

---

## Task 7: Database Layer + Hooks

**Files:**
- Create: `src/supabase/database.js`
- Create: `src/hooks/useProducts.js` (replace existing)
- Create: `src/hooks/useSales.js` (replace existing)
- Create: `src/hooks/useDashboardStats.js` (new)

- [ ] **Step 1: Create database CRUD functions**

Create `src/supabase/database.js`:

```js
import { supabase } from './client';

// --- Products ---

export async function fetchProducts(userId) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addProduct(userId, product) {
  const { data, error } = await supabase
    .from('products')
    .insert({ ...product, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProductStock(productId, newStock) {
  const { error } = await supabase
    .from('products')
    .update({ current_stock: newStock })
    .eq('id', productId);
  if (error) throw error;
}

export async function deleteProduct(productId) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
  if (error) throw error;
}

// --- Sales ---

export async function fetchSales(userId) {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createSale(userId, sale) {
  const { data, error } = await supabase
    .from('sales')
    .insert({ ...sale, user_id: userId })
    .select()
    .single();
  if (error) throw error;

  // Decrement stock
  const { data: product } = await supabase
    .from('products')
    .select('current_stock')
    .eq('id', sale.product_id)
    .single();

  if (product) {
    await updateProductStock(sale.product_id, product.current_stock - sale.quantity);
  }

  return data;
}

export async function deleteSale(saleId) {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', saleId);
  if (error) throw error;
}
```

- [ ] **Step 2: Create useProducts hook**

Replace `src/hooks/useProducts.js`:

```js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase/client';
import * as db from '../supabase/database';

export function useProducts(searchQuery = '') {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    db.fetchProducts(user.id).then(setProducts).catch(console.error);

    // Real-time subscription
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products', filter: `user_id=eq.${user.id}` },
        () => {
          db.fetchProducts(user.id).then(setProducts).catch(console.error);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.current_stock <= p.low_stock_threshold),
    [products]
  );

  const addProduct = useCallback(
    async (product) => {
      if (!user) throw new Error('Not authenticated');
      return db.addProduct(user.id, product);
    },
    [user]
  );

  const updateStock = useCallback(async (productId, newStock) => {
    return db.updateProductStock(productId, newStock);
  }, []);

  return { products: filteredProducts, allProducts: products, lowStockProducts, addProduct, updateStock };
}
```

- [ ] **Step 3: Create useSales hook**

Replace `src/hooks/useSales.js`:

```js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase/client';
import * as db from '../supabase/database';

export function useSales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);

  useEffect(() => {
    if (!user) return;

    db.fetchSales(user.id).then(setSales).catch(console.error);

    const channel = supabase
      .channel('sales-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales', filter: `user_id=eq.${user.id}` },
        () => {
          db.fetchSales(user.id).then(setSales).catch(console.error);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const recordSale = useCallback(
    async (saleData) => {
      if (!user) throw new Error('Not authenticated');
      return db.createSale(user.id, saleData);
    },
    [user]
  );

  return { sales, recordSale };
}
```

- [ ] **Step 4: Create useDashboardStats hook**

Create `src/hooks/useDashboardStats.js`:

```js
import { useMemo } from 'react';

function isToday(dateStr) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function isYesterday(dateStr) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(dateStr).toDateString() === yesterday.toDateString();
}

function isCurrentMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isLastMonth(dateStr) {
  const d = new Date(dateStr);
  const last = new Date();
  last.setMonth(last.getMonth() - 1);
  return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
}

function percentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function useDashboardStats(sales, lowStockCount) {
  return useMemo(() => {
    const todaySales = sales.filter((s) => isToday(s.created_at));
    const yesterdaySales = sales.filter((s) => isYesterday(s.created_at));
    const monthSales = sales.filter((s) => isCurrentMonth(s.created_at));
    const lastMonthSales = sales.filter((s) => isLastMonth(s.created_at));

    const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const todayItemsSold = todaySales.reduce((sum, s) => sum + s.quantity, 0);
    const yesterdayItemsSold = yesterdaySales.reduce((sum, s) => sum + s.quantity, 0);
    const todayProfit = todaySales.reduce((sum, s) => sum + Number(s.profit), 0);
    const yesterdayProfit = yesterdaySales.reduce((sum, s) => sum + Number(s.profit), 0);

    const mtdSales = monthSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const lastMtdSales = lastMonthSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const mtdProfit = monthSales.reduce((sum, s) => sum + Number(s.profit), 0);
    const lastMtdProfit = lastMonthSales.reduce((sum, s) => sum + Number(s.profit), 0);

    const now = new Date();
    const daysElapsed = now.getDate();

    return {
      todayRevenue,
      revenueChange: percentChange(todayRevenue, yesterdayRevenue),
      todayItemsSold,
      itemsSoldChange: percentChange(todayItemsSold, yesterdayItemsSold),
      todayProfit,
      profitChange: percentChange(todayProfit, yesterdayProfit),
      mtdSales,
      mtdSalesChange: percentChange(mtdSales, lastMtdSales),
      mtdProfit,
      mtdProfitChange: percentChange(mtdProfit, lastMtdProfit),
      lowStockCount,
      daysElapsed,
      recentTransactions: sales.slice(0, 10),
    };
  }, [sales, lowStockCount]);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/supabase/database.js src/hooks/
git commit -m "feat: add Supabase database layer and data hooks with real-time"
```

---

## Task 8: Dashboard Screen

**Files:**
- Create: `src/components/dashboard/MetricCard.jsx`
- Create: `src/components/dashboard/RecentTransactions.jsx`
- Create: `src/screens/Dashboard.jsx` (replace existing)

- [ ] **Step 1: Create MetricCard component**

Create `src/components/dashboard/MetricCard.jsx`:

```jsx
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export function MetricCard({ label, value, change, icon, subtitle }) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      </div>
      <div className="text-3xl font-semibold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create RecentTransactions component**

Create `src/components/dashboard/RecentTransactions.jsx`:

```jsx
import { motion } from 'framer-motion';

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function RecentTransactions({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="px-5 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <p className="text-sm text-gray-400 text-center py-8">No sales recorded today</p>
      </div>
    );
  }

  return (
    <div className="px-5 mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
      <div className="space-y-3">
        {transactions.map((txn, index) => (
          <motion.div
            key={txn.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{txn.product_name}</div>
              <div className="text-xs text-gray-500 mt-1">
                Qty: {txn.quantity} &bull; {formatTime(txn.created_at)}
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {formatCurrency(txn.total_amount)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Dashboard screen**

Replace `src/screens/Dashboard.jsx`:

```jsx
import { DollarSign, ShoppingCart, Percent, Calendar, TrendingUp, Package } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { MetricCard } from '../components/dashboard/MetricCard';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { RecordSaleSheet } from '../components/dashboard/RecordSaleSheet';
import { useSales } from '../hooks/useSales';
import { useProducts } from '../hooks/useProducts';
import { useDashboardStats } from '../hooks/useDashboardStats';

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function Dashboard() {
  const { sales, recordSale } = useSales();
  const { allProducts, lowStockProducts } = useProducts();
  const stats = useDashboardStats(sales, lowStockProducts.length);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Layout>
      <div className="pb-24">
        <div className="px-5 pt-8 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">{today}</p>
        </div>

        <div className="px-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Today's Performance</h2>
          <div className="space-y-3">
            <MetricCard
              label="Revenue"
              value={formatCurrency(stats.todayRevenue)}
              change={stats.revenueChange}
              icon={<DollarSign className="w-5 h-5" />}
              subtitle="vs. yesterday"
            />
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Items Sold"
                value={String(stats.todayItemsSold)}
                change={stats.itemsSoldChange}
                icon={<ShoppingCart className="w-5 h-5" />}
              />
              <MetricCard
                label="Profit"
                value={formatCurrency(stats.todayProfit)}
                change={stats.profitChange}
                icon={<Percent className="w-5 h-5" />}
              />
            </div>
          </div>
        </div>

        <div className="px-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{currentMonth}</h2>
          <div className="space-y-3">
            <MetricCard
              label="Month to Date Sales"
              value={formatCurrency(stats.mtdSales)}
              change={stats.mtdSalesChange}
              icon={<Calendar className="w-5 h-5" />}
              subtitle={`${stats.daysElapsed} days elapsed`}
            />
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="MTD Profit"
                value={formatCurrency(stats.mtdProfit)}
                change={stats.mtdProfitChange}
                icon={<TrendingUp className="w-5 h-5" />}
              />
              <MetricCard
                label="Low Stock"
                value={String(stats.lowStockCount)}
                change={0}
                icon={<Package className="w-5 h-5" />}
              />
            </div>
          </div>
        </div>

        <RecentTransactions transactions={stats.recentTransactions} />
      </div>

      <RecordSaleSheet products={allProducts} onRecordSale={recordSale} />
    </Layout>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/ src/screens/Dashboard.jsx
git commit -m "feat: add Dashboard screen with MetricCards and RecentTransactions"
```

---

## Task 9: Record Sale FAB + Bottom Sheet

**Files:**
- Create: `src/components/dashboard/RecordSaleSheet.jsx`

- [ ] **Step 1: Create RecordSaleSheet**

Create `src/components/dashboard/RecordSaleSheet.jsx`:

```jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, Minus } from 'lucide-react';
import { useToast } from '../common/Toast';

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function RecordSaleSheet({ products, onRecordSale }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) && p.current_stock > 0
  );

  const totalAmount = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSearchQuery('');
  };

  const handleCompleteSale = async () => {
    if (!selectedProduct || quantity <= 0) return;
    setIsProcessing(true);
    try {
      await onRecordSale({
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity,
        unit_price: selectedProduct.price,
        cost_price: selectedProduct.cost_price,
        total_amount: selectedProduct.price * quantity,
        profit: (selectedProduct.price - selectedProduct.cost_price) * quantity,
      });
      showToast(`Sale recorded: ${formatCurrency(totalAmount)}`, 'success');
      setIsOpen(false);
      setSelectedProduct(null);
      setQuantity(1);
    } catch (err) {
      showToast(err.message || 'Failed to record sale', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setSelectedProduct(null);
    setQuantity(1);
    setSearchQuery('');
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center active:scale-90 transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={close}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Record Sale</h2>
                <button onClick={close} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5">
                {!selectedProduct ? (
                  <>
                    <div className="relative mb-4">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatCurrency(product.price)} &bull; {product.current_stock} in stock
                          </div>
                        </button>
                      ))}
                      {filteredProducts.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-8">No products available</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm font-medium text-gray-900">{selectedProduct.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatCurrency(selectedProduct.price)} per unit &bull; {selectedProduct.current_stock} in stock
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-5">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors active:scale-95 disabled:opacity-30"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <div className="text-4xl font-bold text-gray-900 min-w-[4rem] text-center">
                        {quantity}
                      </div>
                      <button
                        onClick={() => setQuantity((q) => Math.min(selectedProduct.current_stock, q + 1))}
                        disabled={quantity >= selectedProduct.current_stock}
                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors active:scale-95 disabled:opacity-30"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Total</p>
                      <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleCompleteSale}
                        disabled={isProcessing}
                        className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Complete Sale'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 2: Verify Dashboard with FAB renders**

```bash
npm run dev
```

Sign up a test user, verify Dashboard shows with the blue FAB in bottom-right. Tap FAB, verify bottom sheet opens.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/RecordSaleSheet.jsx
git commit -m "feat: add Record Sale FAB with bottom sheet"
```

---

## Task 10: Inventory Screen

**Files:**
- Create: `src/components/inventory/ProductCard.jsx`
- Create: `src/components/inventory/AddItemModal.jsx`
- Create: `src/screens/Inventory.jsx` (replace existing)

- [ ] **Step 1: Create ProductCard**

Create `src/components/inventory/ProductCard.jsx`:

```jsx
import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProductCard({ product, index, onUpdateStock }) {
  const isLowStock = product.current_stock <= product.low_stock_threshold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-xl p-4 border ${
        isLowStock ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
            {isLowStock && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                Low
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            SKU: {product.sku || '—'} &bull; ₹{Number(product.price).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">Stock Level</div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onUpdateStock(product.id, Math.max(0, product.current_stock - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors active:scale-95"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="text-lg font-semibold text-gray-900 min-w-[3rem] text-center">
            {product.current_stock}
          </div>
          <button
            onClick={() => onUpdateStock(product.id, product.current_stock + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create AddItemModal**

Create `src/components/inventory/AddItemModal.jsx`:

```jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function AddItemModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '', sku: '', stock: '', price: '', cost_price: '', category: 'General', lowStockThreshold: '',
  });

  const update = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd({
      name: formData.name,
      sku: formData.sku,
      current_stock: parseInt(formData.stock),
      price: parseFloat(formData.price),
      cost_price: parseFloat(formData.cost_price) || 0,
      category: formData.category,
      low_stock_threshold: parseInt(formData.lowStockThreshold) || 10,
    });
    setFormData({ name: '', sku: '', stock: '', price: '', cost_price: '', category: 'General', lowStockThreshold: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New Item</h2>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input type="text" value={formData.name} onChange={update('name')} placeholder="Enter product name" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input type="text" value={formData.sku} onChange={update('sku')} placeholder="ABC-001" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select value={formData.category} onChange={update('category')} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="General">General</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Tea">Tea</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={update('price')} placeholder="0.00" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price (₹)</label>
                  <input type="number" step="0.01" value={formData.cost_price} onChange={update('cost_price')} placeholder="0.00" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Stock</label>
                  <input type="number" value={formData.stock} onChange={update('stock')} placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Alert</label>
                  <input type="number" value={formData.lowStockThreshold} onChange={update('lowStockThreshold')} placeholder="10" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">Add Item</button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Create Inventory screen**

Replace `src/screens/Inventory.jsx`:

```jsx
import { useState } from 'react';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { ProductCard } from '../components/inventory/ProductCard';
import { AddItemModal } from '../components/inventory/AddItemModal';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../components/common/Toast';

export function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { products, allProducts, lowStockProducts, addProduct, updateStock } = useProducts(searchQuery);
  const { showToast } = useToast();

  const handleAddProduct = async (product) => {
    try {
      await addProduct(product);
      showToast('Product added successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add product', 'error');
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      await updateStock(productId, newStock);
    } catch (err) {
      showToast(err.message || 'Failed to update stock', 'error');
    }
  };

  return (
    <Layout>
      <div className="pb-24">
        <div className="px-5 pt-8 pb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Inventory</h1>
            <p className="text-sm text-gray-500">{allProducts.length} items tracked</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="px-5 mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-amber-900">{lowStockProducts.length} items low on stock</div>
                <div className="text-xs text-amber-700 mt-1">Review and reorder soon</div>
              </div>
            </motion.div>
          </div>
        )}

        <div className="px-5 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="px-5 space-y-3">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onUpdateStock={handleUpdateStock} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="px-5 py-12 text-center">
            <div className="text-sm text-gray-500">No products found</div>
          </div>
        )}

        <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddProduct} />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/inventory/ src/screens/Inventory.jsx
git commit -m "feat: add Inventory screen with ProductCard and AddItemModal"
```

---

## Task 11: Sales Insights Screen

**Files:**
- Create: `src/components/sales/SalesChart.jsx`
- Create: `src/components/sales/TopProducts.jsx`
- Create: `src/screens/SalesInsights.jsx` (new)

- [ ] **Step 1: Create SalesChart**

Create `src/components/sales/SalesChart.jsx`:

```jsx
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SalesChart({ data, dataKey, fill, type = 'bar', label = 'Value' }) {
  const tooltipFormatter = (value) => [`₹${Number(value).toLocaleString('en-IN')}`, label];

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '12px',
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      {type === 'bar' ? (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#999" />
          <YAxis tick={{ fontSize: 12 }} stroke="#999" />
          <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
          <Bar dataKey={dataKey} fill={fill} radius={[8, 8, 0, 0]} />
        </BarChart>
      ) : (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#999" />
          <YAxis tick={{ fontSize: 12 }} stroke="#999" />
          <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
          <Line type="monotone" dataKey={dataKey} stroke={fill} strokeWidth={3} dot={{ fill, r: 4 }} />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Create TopProducts**

Create `src/components/sales/TopProducts.jsx`:

```jsx
import { motion } from 'framer-motion';

export function TopProducts({ products }) {
  if (!products || products.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No sales data yet</p>;
  }

  const maxSold = Math.max(...products.map((p) => p.sold));

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <motion.div
          key={product.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{product.name}</div>
              <div className="text-xs text-gray-500 mt-1">{product.sold} units sold</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">₹{Number(product.revenue).toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(product.sold / maxSold) * 100}%` }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create SalesInsights screen**

Create `src/screens/SalesInsights.jsx`:

```jsx
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { SalesChart } from '../components/sales/SalesChart';
import { TopProducts } from '../components/sales/TopProducts';
import { useSales } from '../hooks/useSales';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function SalesInsights() {
  const { sales } = useSales();
  const [viewMode, setViewMode] = useState('daily');

  const dailyData = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(dayStart);
      d.setDate(dayStart.getDate() + i);
      return { date: d, label: DAY_NAMES[d.getDay()], sales: 0, profit: 0, items: 0 };
    });

    sales.forEach((s) => {
      const sDate = new Date(s.created_at);
      const dayIndex = days.findIndex((d) => d.date.toDateString() === sDate.toDateString());
      if (dayIndex >= 0) {
        days[dayIndex].sales += Number(s.total_amount);
        days[dayIndex].profit += Number(s.profit);
        days[dayIndex].items += s.quantity;
      }
    });

    return days;
  }, [sales]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const monthSales = sales.filter((s) => {
        const sd = new Date(s.created_at);
        return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
      });
      return {
        label: MONTH_NAMES[d.getMonth()],
        sales: monthSales.reduce((sum, s) => sum + Number(s.total_amount), 0),
        profit: monthSales.reduce((sum, s) => sum + Number(s.profit), 0),
      };
    });
  }, [sales]);

  const bestDay = useMemo(() => {
    return dailyData.reduce((prev, current) => (current.profit > prev.profit ? current : prev), dailyData[0]);
  }, [dailyData]);

  const topProducts = useMemo(() => {
    const productMap = {};
    sales.forEach((s) => {
      if (!productMap[s.product_name]) {
        productMap[s.product_name] = { name: s.product_name, sold: 0, revenue: 0 };
      }
      productMap[s.product_name].sold += s.quantity;
      productMap[s.product_name].revenue += Number(s.total_amount);
    });
    return Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [sales]);

  const chartData = viewMode === 'daily' ? dailyData : monthlyData;

  return (
    <Layout>
      <div className="pb-24">
        <div className="px-5 pt-8 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sales Insights</h1>
          <p className="text-sm text-gray-500">Track your performance</p>
        </div>

        {/* Best Day Card */}
        <div className="px-5 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium opacity-90">Best Day This Week</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-4xl font-bold mb-1">{bestDay?.label || '—'}</div>
                <div className="text-sm opacity-90">₹{bestDay?.profit.toLocaleString('en-IN') || 0} profit</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">₹{bestDay?.sales.toLocaleString('en-IN') || 0}</div>
                <div className="text-xs opacity-90">{bestDay?.items || 0} items sold</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Toggle */}
        <div className="px-5 mb-6">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('daily')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Daily Sales
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Monthly Sales
            </button>
          </div>
        </div>

        {/* Charts */}
        <motion.div key={viewMode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              {viewMode === 'daily' ? 'This Week — Sales' : 'Last 6 Months — Sales'}
            </h2>
            <SalesChart data={chartData} dataKey="sales" fill="#3b82f6" type={viewMode === 'daily' ? 'bar' : 'line'} label="Sales" />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              {viewMode === 'daily' ? 'This Week — Profit' : 'Last 6 Months — Profit'}
            </h2>
            <SalesChart data={chartData} dataKey="profit" fill="#10b981" type={viewMode === 'daily' ? 'bar' : 'line'} label="Profit" />
          </div>
        </motion.div>

        {/* Top Products */}
        <div className="px-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
          <TopProducts products={topProducts} />
        </div>
      </div>
    </Layout>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/sales/ src/screens/SalesInsights.jsx
git commit -m "feat: add Sales Insights screen with charts and top products"
```

---

## Task 12: Cleanup — Remove Old Files

**Files:** Delete all files listed in the "Delete" section of the File Map above.

- [ ] **Step 1: Delete Firebase and Dexie directories**

```bash
rm -rf src/firebase/ src/db/
```

- [ ] **Step 2: Delete old screens**

```bash
rm -f src/screens/QuickSale.jsx src/screens/Products.jsx src/screens/Admin.jsx src/screens/Insights.jsx
```

- [ ] **Step 3: Delete old components**

```bash
rm -f src/components/auth/ProtectedRoute.jsx
rm -f src/components/dashboard/QuickStats.jsx src/components/dashboard/TopProducts.jsx
rm -f src/components/sales/ProductSelector.jsx
rm -f src/components/products/ProductForm.jsx
rm -f src/components/common/Button.jsx src/components/common/Card.jsx src/components/common/Input.jsx src/components/common/Modal.jsx src/components/common/Skeleton.jsx
rm -f src/components/layout/TopBar.jsx
```

- [ ] **Step 4: Delete old hooks and utils**

```bash
rm -f src/hooks/useDailySummary.js src/hooks/useInventory.js
rm -f src/utils/dateHelpers.js
rm -f src/contexts/AppContext.jsx
rm -f firestore.rules
```

- [ ] **Step 5: Remove empty directories**

```bash
rmdir src/components/auth src/components/products 2>/dev/null; true
```

- [ ] **Step 6: Verify the app compiles cleanly**

```bash
npm run dev
```

Expected: No import errors, no missing module warnings. All 3 tabs render.

- [ ] **Step 7: Verify the build succeeds**

```bash
npm run build
```

Expected: Clean build with no errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: remove Firebase, Dexie, and all replaced screens/components"
```

---

## Task 13: Final Verification

- [ ] **Step 1: Test auth flow**

1. Open `http://localhost:5173/login`
2. Click "Sign Up" — create a test account
3. Verify redirect to Dashboard after signup
4. Refresh the page — verify session persists
5. Navigate to `/login` — verify redirect to `/` (PublicRoute guard)

- [ ] **Step 2: Test inventory**

1. Go to Inventory tab
2. Tap "+" button — add a product (name, SKU, price, cost price, stock)
3. Verify product appears in the list
4. Tap +/- to adjust stock — verify updates
5. Add more products, verify low stock alert appears for items below threshold
6. Test search filtering

- [ ] **Step 3: Test Record Sale**

1. Go to Dashboard
2. Tap the blue FAB
3. Search and select a product
4. Adjust quantity, verify total updates
5. Tap "Complete Sale"
6. Verify success toast
7. Verify "Recent Transactions" shows the sale
8. Verify Dashboard metrics update
9. Verify Inventory stock decreased

- [ ] **Step 4: Test Sales Insights**

1. Go to Sales tab
2. Verify "Best Day This Week" card shows data
3. Toggle between Daily/Monthly
4. Verify charts render
5. Verify Top Products list

- [ ] **Step 5: Test PWA**

```bash
npm run build && npm run preview
```

Open in Chrome, verify PWA install prompt works and service worker registers.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete Figma redesign with Supabase migration"
```
