# Contributing to Costwatch

Thanks for helping! Costwatch is a small, focused tool, and contributions that keep it that
way are very welcome.

## Scope

Costwatch answers one question: **how much does my product actually cost me?** Please open an
issue before starting on anything large. These are out of scope for now: accounting, invoicing,
taxes, payroll, bank connections, payment-processor sync, forecasting, and team permissions.

## Getting set up

You need Node.js 20.9+ (22 recommended), and either Docker for the Supabase CLI or a hosted
Supabase project.

```bash
git clone https://github.com/App-Chef/costwatch.git
cd costwatch
npx supabase start          # local Postgres, Auth, Studio (needs Docker)
npx supabase db reset       # migrations + demo seed data
cd web
cp .env.example .env.local  # paste the API URL and anon key from `supabase status`
npm install
npm run dev
```

Sign in with the demo account `demo@example.com` / `costwatch-demo`.

## Checks

Run these before opening a pull request:

```bash
cd web
npm run lint
npm run typecheck
npm run build
```

## Guidelines

- **Database changes** go in a new file in `supabase/migrations/`. Never edit a migration that has
  been released. Every new table needs RLS, policies, and explicit grants. Update `web/types/database.ts` as well.
- **Money math** belongs in `web/lib/calc.ts` as pure functions. Never convert
  currencies silently.
- **Data access** goes through `web/lib/data/*` (server-only). UI components don't query Supabase
  directly.
- **UI**: follow the existing design tokens in `app/globals.css`, with thin borders, small radii and
  one accent. Keep it accessible: labels on every input, visible focus, and no information
  conveyed by color alone.
- **Privacy**: no real financial data, emails or keys in code, fixtures or screenshots.

## Commit and PR style

Small, focused PRs with a clear description are easiest to review. Explain *why* as well as
*what*. Screenshots help for UI changes.

By contributing, you agree that your contributions are licensed under the MIT License.
