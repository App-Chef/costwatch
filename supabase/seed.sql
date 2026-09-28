-- ===========================================================================
-- DEMO DATA — for local development only.
--
-- Creates one demo account with two example products. Every name and number
-- below is made up to exercise the UI; none of it describes a real product,
-- company or user. `supabase db reset` runs this file after the migrations.
--
--   Email:    demo@example.com
--   Password: costwatch-demo
-- ===========================================================================

do $$
declare
  demo_user constant uuid := '11111111-1111-4111-8111-111111111111';
  amazu     uuid;
  financ    uuid;
  today     constant date := current_date;
  m0        constant date := date_trunc('month', current_date)::date;
  c         uuid;
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) values (
    '00000000-0000-0000-0000-000000000000', demo_user, 'authenticated', 'authenticated',
    'demo@example.com', extensions.crypt('costwatch-demo', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"name":"Demo user"}', now(), now(),
    '', '', '', ''
  );

  insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), demo_user::text, demo_user,
    jsonb_build_object('sub', demo_user::text, 'email', 'demo@example.com', 'email_verified', true),
    'email', now(), now(), now()
  );

  -- -------------------------------------------------------------------------
  -- Amazu (USD) — demo SaaS
  -- -------------------------------------------------------------------------
  insert into public.products (user_id, name, description, currency, created_at)
  values (demo_user, 'Amazu', 'Demo product — a small SaaS used to preview Costwatch.', 'USD', now() - interval '10 months')
  returning id into amazu;

  insert into public.costs (product_id, name, provider, amount, currency, billing_cycle, category, start_date, next_renewal, description)
  values
    (amazu, 'Vercel Pro',      'Vercel',   20, 'USD', 'monthly', 'hosting',  (m0 - interval '10 months')::date, today + 4,  'Team plan, one seat.'),
    (amazu, 'Supabase Pro',    'Supabase', 25, 'USD', 'monthly', 'database', (m0 - interval '9 months')::date,  today + 11, null),
    (amazu, 'amazu.app',       'Cloudflare', 12, 'USD', 'yearly', 'domain',  (m0 - interval '10 months')::date, today + 34, 'Registered through Cloudflare Registrar.'),
    (amazu, 'Figma',           'Figma',    15, 'USD', 'monthly', 'design',   (m0 - interval '6 months')::date,  today + 23, null),
    (amazu, 'Google Workspace','Google',   14, 'USD', 'quarterly', 'email',  (m0 - interval '8 months')::date,  today + 52, 'Billed every three months.');

  -- OpenAI usage grew over time: $12/month, then $30/month for the last 3 months.
  insert into public.costs (product_id, name, provider, amount, currency, billing_cycle, category, start_date, next_renewal, description)
  values (amazu, 'OpenAI API', 'OpenAI', 12, 'USD', 'monthly', 'api', (m0 - interval '7 months')::date, today + 18, 'Usage-based; amount is a typical month.')
  returning id into c;
  update public.costs set amount = 30 where id = c;

  -- A one-time cost and a paused subscription.
  insert into public.costs (product_id, name, provider, amount, currency, billing_cycle, category, start_date, description)
  values (amazu, 'Logo design', null, 150, 'USD', 'one_time', 'design', (m0 - interval '8 months')::date, 'Paid once to a freelancer.');

  insert into public.costs (product_id, name, provider, amount, currency, billing_cycle, category, start_date, next_renewal, status)
  values (amazu, 'Plausible Analytics', 'Plausible', 9, 'USD', 'monthly', 'marketing', (m0 - interval '5 months')::date, today + 7, 'active')
  returning id into c;
  update public.costs set status = 'paused' where id = c;

  -- Backdate the demo history so charts have something to show. Real history
  -- is recorded automatically as the user edits their costs.
  update public.cost_history h
     set recorded_at = coalesce(x.start_date, x.created_at::date)::timestamptz
    from public.costs x
   where h.cost_id = x.id and x.product_id = amazu
     and h.id = (select min(id) from public.cost_history where cost_id = x.id);

  update public.cost_history h
     set recorded_at = (m0 - interval '2 months')::timestamptz
    from public.costs x
   where h.cost_id = x.id and x.name = 'OpenAI API' and x.product_id = amazu
     and h.id = (select max(id) from public.cost_history where cost_id = x.id);

  update public.cost_history h
     set recorded_at = (m0 - interval '1 month')::timestamptz
    from public.costs x
   where h.cost_id = x.id and x.name = 'Plausible Analytics' and x.product_id = amazu
     and h.id = (select max(id) from public.cost_history where cost_id = x.id);

  insert into public.revenue (product_id, amount, currency, source, date, description)
  select amazu, amt, 'USD', src, least(today, (m0 - (n || ' months')::interval + (d || ' days')::interval)::date), descr
  from (values
    (5,  560, 'Stripe', 2, 'Subscriptions'),   (5, 220, 'App Store', 14, null),
    (4,  610, 'Stripe', 2, 'Subscriptions'),   (4, 250, 'App Store', 14, null),
    (3,  680, 'Stripe', 2, 'Subscriptions'),   (3, 260, 'App Store', 14, null),
    (2,  720, 'Stripe', 2, 'Subscriptions'),   (2, 290, 'App Store', 14, null),
    (1,  810, 'Stripe', 2, 'Subscriptions'),   (1, 300, 'App Store', 14, null),
    (0,  900, 'Stripe', 1, 'Subscriptions'),   (0, 340, 'App Store', 1, null)
  ) as v(n, amt, src, d, descr);

  -- -------------------------------------------------------------------------
  -- Financ (RWF) — demo side project
  -- -------------------------------------------------------------------------
  insert into public.products (user_id, name, description, currency, created_at)
  values (demo_user, 'Financ', 'Demo product — a side project billed in Rwandan francs.', 'RWF', now() - interval '4 months')
  returning id into financ;

  insert into public.costs (product_id, name, provider, amount, currency, billing_cycle, category, start_date, next_renewal)
  values
    (financ, 'VPS',         'DigitalOcean', 15000, 'RWF', 'monthly', 'infrastructure', (m0 - interval '4 months')::date, today + 9),
    (financ, 'financ.rw',   null,           20000, 'RWF', 'yearly',  'domain',         (m0 - interval '4 months')::date, today + 120),
    (financ, 'Resend',      'Resend',          20, 'USD', 'monthly', 'email',          (m0 - interval '2 months')::date, today + 15);

  update public.cost_history h
     set recorded_at = coalesce(x.start_date, x.created_at::date)::timestamptz
    from public.costs x
   where h.cost_id = x.id and x.product_id = financ;

  insert into public.revenue (product_id, amount, currency, source, date)
  values
    (financ, 45000,  'RWF', 'MoMo',  (m0 - interval '2 months')::date + 5),
    (financ, 80000,  'RWF', 'MoMo',  (m0 - interval '1 month')::date + 5),
    (financ, 120000, 'RWF', 'MoMo',  least(today, m0 + 5));
end
$$;
