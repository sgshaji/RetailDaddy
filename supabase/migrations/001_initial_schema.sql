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
