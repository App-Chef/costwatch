-- Row Level Security tests for Costwatch.
--
-- Two users, Ada and Ben, each own a product. Every test acts as one of them
-- (role `authenticated` + JWT `sub` claim, exactly like PostgREST) and tries
-- to read or modify the other's data. Any failure raises and aborts the run.
--
-- Run with: ./supabase/tests/run.sh

\set ON_ERROR_STOP on
\set QUIET on

-- ---------------------------------------------------------------------------
-- Fixtures (as superuser)
-- ---------------------------------------------------------------------------

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'ada@example.test', '{"name":"Ada"}'),
  ('00000000-0000-0000-0000-0000000000b2', 'ben@example.test', '{"full_name":"Ben"}');

create schema tests;
grant usage on schema tests to authenticated, anon;
create table tests.ids (key text primary key, id uuid not null);
grant select, insert on tests.ids to authenticated;

create function tests.id(k text) returns uuid language sql stable as $$
  select id from tests.ids where key = k
$$;
grant execute on function tests.id(text) to authenticated;

create procedure tests.ok(msg text) language plpgsql as $$
begin
  raise notice 'ok - %', msg;
end $$;
grant execute on procedure tests.ok(text) to authenticated, anon;

do $$
begin
  assert (select count(*) from public.profiles) = 2, 'profiles are created by trigger';
  assert (select name from public.profiles where email = 'ada@example.test') = 'Ada', 'name from metadata';
  assert (select name from public.profiles where email = 'ben@example.test') = 'Ben', 'full_name from metadata';
end $$;
call tests.ok('profiles are created for new auth users');

-- ---------------------------------------------------------------------------
-- Ada creates her data
-- ---------------------------------------------------------------------------

set role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', false) \g /dev/null

do $$
declare
  pid uuid;
  cid uuid;
  rid uuid;
begin
  insert into public.products (name, currency) values ('Ada App', 'USD') returning id into pid;
  assert (select user_id from public.products where id = pid) = '00000000-0000-0000-0000-0000000000a1',
    'user_id defaults to auth.uid()';

  insert into public.costs (product_id, name, amount, currency, billing_cycle, category, next_renewal)
  values (pid, 'Vercel', 20, 'USD', 'monthly', 'hosting', current_date + 4)
  returning id into cid;

  insert into public.revenue (product_id, amount, currency, source, date)
  values (pid, 1240, 'USD', 'Stripe', current_date)
  returning id into rid;

  insert into tests.ids values ('ada_product', pid), ('ada_cost', cid), ('ada_revenue', rid);
end $$;
call tests.ok('owner can create product, cost and revenue');

do $$
begin
  assert (select count(*) from public.cost_history where cost_id = tests.id('ada_cost')) = 1,
    'history snapshot on insert';
  update public.costs set amount = 40 where id = tests.id('ada_cost');
  update public.costs set description = 'Pro plan' where id = tests.id('ada_cost');
  assert (select count(*) from public.cost_history where cost_id = tests.id('ada_cost')) = 2,
    'history snapshot only when price/cycle/status changes';
  assert (select amount from public.cost_history where cost_id = tests.id('ada_cost') order by recorded_at desc, id desc limit 1) = 40,
    'latest snapshot has new amount';
end $$;
call tests.ok('cost history records price changes');

do $$
begin
  insert into public.cost_history (cost_id, product_id, amount, currency, billing_cycle, status)
  values (tests.id('ada_cost'), tests.id('ada_product'), 1, 'USD', 'monthly', 'active');
  raise exception 'FAIL: user could write cost_history directly';
exception when insufficient_privilege then
  null;
end $$;
call tests.ok('users cannot write cost history directly');

do $$
begin
  update public.profiles set email = 'spoof@example.test' where id = '00000000-0000-0000-0000-0000000000a1';
  raise exception 'FAIL: user could change profile email';
exception when insufficient_privilege then
  null;
end $$;
call tests.ok('users cannot change their profile email column');

reset role;

-- ---------------------------------------------------------------------------
-- Ben tries to reach Ada's data
-- ---------------------------------------------------------------------------

set role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', false) \g /dev/null

do $$
declare
  n int;
  ben_pid uuid;
  ben_cid uuid;
begin
  assert (select count(*) from public.profiles) = 1, 'Ben sees only his own profile';
  assert (select count(*) from public.products) = 0, 'Ben sees no products';
  assert (select count(*) from public.costs) = 0, 'Ben sees no costs';
  assert (select count(*) from public.revenue) = 0, 'Ben sees no revenue';
  assert (select count(*) from public.cost_history) = 0, 'Ben sees no cost history';

  update public.products set name = 'pwned' where id = tests.id('ada_product');
  get diagnostics n = row_count;
  assert n = 0, 'Ben cannot update Ada''s product';

  update public.costs set amount = 0 where id = tests.id('ada_cost');
  get diagnostics n = row_count;
  assert n = 0, 'Ben cannot update Ada''s cost';

  update public.revenue set amount = 0 where id = tests.id('ada_revenue');
  get diagnostics n = row_count;
  assert n = 0, 'Ben cannot update Ada''s revenue';

  update public.profiles set name = 'pwned' where id = '00000000-0000-0000-0000-0000000000a1';
  get diagnostics n = row_count;
  assert n = 0, 'Ben cannot update Ada''s profile';

  delete from public.costs where id = tests.id('ada_cost');
  get diagnostics n = row_count;
  assert n = 0, 'Ben cannot delete Ada''s cost';

  delete from public.revenue where id = tests.id('ada_revenue');
  get diagnostics n = row_count;
  assert n = 0, 'Ben cannot delete Ada''s revenue';

  delete from public.products where id = tests.id('ada_product');
  get diagnostics n = row_count;
  assert n = 0, 'Ben cannot delete Ada''s product';

  assert public.owns_product(tests.id('ada_product')) = false, 'owns_product is false for other users';

  insert into public.products (name, currency) values ('Ben App', 'EUR') returning id into ben_pid;
  insert into public.costs (product_id, name, amount, currency)
  values (ben_pid, 'Hetzner', 5, 'EUR') returning id into ben_cid;
  insert into tests.ids values ('ben_product', ben_pid), ('ben_cost', ben_cid);
end $$;
call tests.ok('another user cannot read, update or delete someone else''s data');

do $$
begin
  insert into public.products (user_id, name, currency)
  values ('00000000-0000-0000-0000-0000000000a1', 'Planted', 'USD');
  raise exception 'FAIL: Ben created a product owned by Ada';
exception when insufficient_privilege then
  null;
end $$;

do $$
begin
  update public.products set user_id = '00000000-0000-0000-0000-0000000000a1' where id = tests.id('ben_product');
  raise exception 'FAIL: Ben transferred a product to Ada';
exception when insufficient_privilege then
  null;
end $$;

do $$
begin
  insert into public.costs (product_id, name, amount, currency)
  values (tests.id('ada_product'), 'Injected', 999, 'USD');
  raise exception 'FAIL: Ben added a cost to Ada''s product';
exception when insufficient_privilege then
  null;
end $$;

do $$
begin
  update public.costs set product_id = tests.id('ada_product') where id = tests.id('ben_cost');
  raise exception 'FAIL: Ben moved a cost onto Ada''s product';
exception when insufficient_privilege then
  null;
end $$;

do $$
begin
  insert into public.revenue (product_id, amount, currency)
  values (tests.id('ada_product'), 1, 'USD');
  raise exception 'FAIL: Ben added revenue to Ada''s product';
exception when insufficient_privilege then
  null;
end $$;
call tests.ok('another user cannot plant, transfer or move data across accounts');

reset role;

-- ---------------------------------------------------------------------------
-- Anonymous access
-- ---------------------------------------------------------------------------

set role anon;
select set_config('request.jwt.claims', '', false) \g /dev/null

do $$
begin
  assert (select count(*) from public.currencies) >= 4, 'anon can read currencies';
  assert (select count(*) from public.categories) = 10, 'anon can read categories';
end $$;

do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'products', 'costs', 'cost_history', 'revenue'] loop
    begin
      execute format('select count(*) from public.%I', t);
      raise exception 'FAIL: anon could read %', t;
    exception when insufficient_privilege then
      null;
    end;
  end loop;
end $$;

do $$
begin
  perform public.delete_account();
  raise exception 'FAIL: anon could call delete_account';
exception when insufficient_privilege then
  null;
end $$;
call tests.ok('anonymous users cannot read any financial table');

reset role;

-- ---------------------------------------------------------------------------
-- Constraints
-- ---------------------------------------------------------------------------

set role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', false) \g /dev/null

do $$
begin
  insert into public.costs (product_id, name, amount, currency) values (tests.id('ada_product'), 'Neg', -1, 'USD');
  raise exception 'FAIL: negative cost accepted';
exception when check_violation then
  null;
end $$;

do $$
begin
  insert into public.revenue (product_id, amount, currency) values (tests.id('ada_product'), -1, 'USD');
  raise exception 'FAIL: negative revenue accepted';
exception when check_violation then
  null;
end $$;

do $$
begin
  insert into public.costs (product_id, name, amount, currency, billing_cycle)
  values (tests.id('ada_product'), 'Custom', 10, 'USD', 'custom');
  raise exception 'FAIL: custom cycle without interval accepted';
exception when check_violation then
  null;
end $$;

do $$
begin
  insert into public.costs (product_id, name, amount, currency, billing_cycle, next_renewal)
  values (tests.id('ada_product'), 'Logo', 300, 'USD', 'one_time', current_date);
  raise exception 'FAIL: one-time cost with renewal accepted';
exception when check_violation then
  null;
end $$;

do $$
begin
  insert into public.costs (product_id, name, amount, currency) values (tests.id('ada_product'), 'Coin', 1, 'XYZ');
  raise exception 'FAIL: unknown currency accepted';
exception when foreign_key_violation then
  null;
end $$;

do $$
begin
  insert into public.costs (product_id, name, amount, currency) values (tests.id('ada_product'), '   ', 1, 'USD');
  raise exception 'FAIL: blank name accepted';
exception when check_violation then
  null;
end $$;
call tests.ok('constraints reject invalid amounts, cycles, currencies and names');

-- ---------------------------------------------------------------------------
-- Cascades and account deletion
-- ---------------------------------------------------------------------------

do $$
declare
  pid uuid;
begin
  insert into public.products (name, currency) values ('Throwaway', 'GBP') returning id into pid;
  insert into public.costs (product_id, name, amount, currency) values (pid, 'x', 1, 'GBP');
  insert into public.revenue (product_id, amount, currency) values (pid, 1, 'GBP');
  delete from public.products where id = pid;
  assert (select count(*) from public.costs where product_id = pid) = 0, 'costs cascade';
  assert (select count(*) from public.revenue where product_id = pid) = 0, 'revenue cascades';
  assert (select count(*) from public.cost_history where product_id = pid) = 0, 'history cascades';
end $$;
call tests.ok('deleting a product removes its costs, revenue and history');

select public.delete_account() \g /dev/null

reset role;

do $$
begin
  assert (select count(*) from auth.users where id = '00000000-0000-0000-0000-0000000000a1') = 0, 'Ada deleted';
  assert (select count(*) from public.profiles where id = '00000000-0000-0000-0000-0000000000a1') = 0, 'Ada profile deleted';
  assert (select count(*) from public.products where user_id = '00000000-0000-0000-0000-0000000000a1') = 0, 'Ada products deleted';
  assert (select count(*) from public.costs where id = tests.id('ada_cost')) = 0, 'Ada costs deleted';
  assert (select count(*) from public.revenue where id = tests.id('ada_revenue')) = 0, 'Ada revenue deleted';
  assert (select count(*) from public.products where id = tests.id('ben_product')) = 1, 'Ben product untouched';
  assert (select count(*) from public.costs where id = tests.id('ben_cost')) = 1, 'Ben cost untouched';
end $$;
call tests.ok('delete_account removes only the caller''s data');

\echo 'All RLS tests passed.'
