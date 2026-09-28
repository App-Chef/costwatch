-- Costwatch initial schema
--
-- Every financial row belongs (directly or through a product) to exactly one
-- auth user. Row Level Security is the authorization boundary: the web app
-- only ever talks to Postgres with the signed-in user's JWT, so these
-- policies are what keep one user's numbers invisible to everyone else.

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------

create table public.currencies (
  code        text primary key check (code ~ '^[A-Z]{3}$'),
  name        text not null,
  minor_units smallint not null default 2 check (minor_units between 0 and 4),
  sort_order  smallint not null default 100
);

insert into public.currencies (code, name, minor_units, sort_order) values
  ('USD', 'US Dollar',       2, 1),
  ('EUR', 'Euro',            2, 2),
  ('GBP', 'British Pound',   2, 3),
  ('RWF', 'Rwandan Franc',   0, 4);

create table public.categories (
  slug       text primary key check (slug ~ '^[a-z][a-z0-9_]*$'),
  name       text not null,
  sort_order smallint not null default 100
);

insert into public.categories (slug, name, sort_order) values
  ('hosting',        'Hosting',        1),
  ('database',       'Database',       2),
  ('domain',         'Domain',         3),
  ('email',          'Email',          4),
  ('api',            'API',            5),
  ('software',       'Software',       6),
  ('marketing',      'Marketing',      7),
  ('infrastructure', 'Infrastructure', 8),
  ('design',         'Design',         9),
  ('other',          'Other',         10);

create type public.billing_cycle as enum ('one_time', 'monthly', 'quarterly', 'yearly', 'custom');
create type public.cost_status   as enum ('active', 'paused', 'inactive');
create type public.interval_unit as enum ('day', 'week', 'month', 'year');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  name       text check (char_length(name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Keep a profile row in sync with every auth user.
create function public.handle_auth_user_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.profiles (id, email, name)
    values (
      new.id,
      new.email,
      nullif(left(coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', ''), 120), '')
    )
    on conflict (id) do nothing;
  elsif new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_change
  after insert or update of email on auth.users
  for each row execute function public.handle_auth_user_change();

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------

create table public.products (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 80),
  description text check (char_length(description) <= 500),
  currency    text not null default 'USD' references public.currencies (code),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index products_user_id_idx on public.products (user_id, created_at);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Costs
-- ---------------------------------------------------------------------------

create table public.costs (
  id                    uuid primary key default gen_random_uuid(),
  product_id            uuid not null references public.products (id) on delete cascade,
  name                  text not null check (char_length(btrim(name)) between 1 and 80),
  description           text check (char_length(description) <= 2000),
  amount                numeric(14, 2) not null check (amount >= 0),
  currency              text not null references public.currencies (code),
  billing_cycle         public.billing_cycle not null default 'monthly',
  -- Only used when billing_cycle = 'custom', e.g. every 6 months, every 2 years.
  custom_interval_count smallint check (custom_interval_count between 1 and 365),
  custom_interval_unit  public.interval_unit,
  category              text not null default 'other' references public.categories (slug),
  provider              text check (char_length(provider) <= 80),
  start_date            date,
  next_renewal          date,
  status                public.cost_status not null default 'active',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint costs_custom_interval_check check (
    (billing_cycle = 'custom' and custom_interval_count is not null and custom_interval_unit is not null)
    or (billing_cycle <> 'custom' and custom_interval_count is null and custom_interval_unit is null)
  ),
  constraint costs_one_time_renewal_check check (
    billing_cycle <> 'one_time' or next_renewal is null
  )
);

create index costs_product_id_idx on public.costs (product_id, created_at);
create index costs_renewal_idx on public.costs (product_id, next_renewal)
  where status = 'active' and next_renewal is not null;

create trigger costs_set_updated_at
  before update on public.costs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Cost history
--
-- A snapshot is written every time a cost is created or its price, cycle or
-- status changes. This is what powers "cost history" and "which costs are
-- growing" without asking the user to maintain anything by hand.
-- ---------------------------------------------------------------------------

create table public.cost_history (
  id                    bigint generated always as identity primary key,
  cost_id               uuid not null references public.costs (id) on delete cascade,
  product_id            uuid not null references public.products (id) on delete cascade,
  amount                numeric(14, 2) not null,
  currency              text not null,
  billing_cycle         public.billing_cycle not null,
  custom_interval_count smallint,
  custom_interval_unit  public.interval_unit,
  status                public.cost_status not null,
  recorded_at           timestamptz not null default now()
);

create index cost_history_product_idx on public.cost_history (product_id, recorded_at);
create index cost_history_cost_idx on public.cost_history (cost_id, recorded_at);

create function public.record_cost_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
     and new.amount is not distinct from old.amount
     and new.currency is not distinct from old.currency
     and new.billing_cycle is not distinct from old.billing_cycle
     and new.custom_interval_count is not distinct from old.custom_interval_count
     and new.custom_interval_unit is not distinct from old.custom_interval_unit
     and new.status is not distinct from old.status
     and new.product_id is not distinct from old.product_id then
    return new;
  end if;

  insert into public.cost_history (
    cost_id, product_id, amount, currency, billing_cycle,
    custom_interval_count, custom_interval_unit, status
  ) values (
    new.id, new.product_id, new.amount, new.currency, new.billing_cycle,
    new.custom_interval_count, new.custom_interval_unit, new.status
  );
  return new;
end;
$$;

create trigger costs_record_history
  after insert or update on public.costs
  for each row execute function public.record_cost_history();

-- ---------------------------------------------------------------------------
-- Revenue
-- ---------------------------------------------------------------------------

create table public.revenue (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  amount      numeric(14, 2) not null check (amount >= 0),
  currency    text not null references public.currencies (code),
  source      text check (char_length(source) <= 80),
  date        date not null default current_date,
  description text check (char_length(description) <= 2000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index revenue_product_date_idx on public.revenue (product_id, date desc);

create trigger revenue_set_updated_at
  before update on public.revenue
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Ownership helper
--
-- security definer so the lookup itself is not subject to RLS recursion, but
-- it only ever answers "does the *current* user own this product?".
-- ---------------------------------------------------------------------------

create function public.owns_product(p_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.products p
    where p.id = p_product_id
      and p.user_id = (select auth.uid())
  );
$$;

revoke all on function public.owns_product(uuid) from public;
grant execute on function public.owns_product(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Account deletion
-- ---------------------------------------------------------------------------

create function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  -- Cascades to profile, products, costs, cost history and revenue.
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_account() from public;
grant execute on function public.delete_account() to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.currencies   enable row level security;
alter table public.categories   enable row level security;
alter table public.profiles     enable row level security;
alter table public.products     enable row level security;
alter table public.costs        enable row level security;
alter table public.cost_history enable row level security;
alter table public.revenue      enable row level security;

-- Reference data is public and read-only.
create policy "Anyone can read currencies" on public.currencies
  for select to anon, authenticated using (true);
create policy "Anyone can read categories" on public.categories
  for select to anon, authenticated using (true);

-- Profiles: a user sees and edits only their own. Rows are created by trigger.
create policy "Users read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Users update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Products
create policy "Users read own products" on public.products
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Users create own products" on public.products
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Users update own products" on public.products
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Users delete own products" on public.products
  for delete to authenticated using (user_id = (select auth.uid()));

-- Costs: ownership is inherited from the product. WITH CHECK also stops a
-- cost from being moved onto someone else's product.
create policy "Users read own costs" on public.costs
  for select to authenticated using (public.owns_product(product_id));
create policy "Users create own costs" on public.costs
  for insert to authenticated with check (public.owns_product(product_id));
create policy "Users update own costs" on public.costs
  for update to authenticated
  using (public.owns_product(product_id))
  with check (public.owns_product(product_id));
create policy "Users delete own costs" on public.costs
  for delete to authenticated using (public.owns_product(product_id));

-- Cost history is written only by trigger; users can read their own.
create policy "Users read own cost history" on public.cost_history
  for select to authenticated using (public.owns_product(product_id));

-- Revenue
create policy "Users read own revenue" on public.revenue
  for select to authenticated using (public.owns_product(product_id));
create policy "Users create own revenue" on public.revenue
  for insert to authenticated with check (public.owns_product(product_id));
create policy "Users update own revenue" on public.revenue
  for update to authenticated
  using (public.owns_product(product_id))
  with check (public.owns_product(product_id));
create policy "Users delete own revenue" on public.revenue
  for delete to authenticated using (public.owns_product(product_id));

-- ---------------------------------------------------------------------------
-- Grants
--
-- Supabase grants broad table privileges to anon/authenticated by default.
-- Tighten them explicitly so the anon key can never touch financial tables,
-- even if a policy were to be misconfigured later.
-- ---------------------------------------------------------------------------

revoke all on public.currencies, public.categories, public.profiles, public.products,
  public.costs, public.cost_history, public.revenue from anon, authenticated;

grant select on public.currencies, public.categories to anon, authenticated;
grant select, update (name) on public.profiles to authenticated;
grant select, insert, update, delete on public.products, public.costs, public.revenue to authenticated;
grant select on public.cost_history to authenticated;
