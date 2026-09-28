# Security Policy

Costwatch stores financial information, so we take security reports seriously.

## Reporting a vulnerability

**Please do not open a public issue.** Report vulnerabilities privately through
[GitHub Security Advisories](https://github.com/App-Chef/costwatch/security/advisories/new).

Include what you found, how to reproduce it, and the impact you expect. We aim to acknowledge
reports within 3 working days and to ship a fix or mitigation as quickly as the severity requires.
We're happy to credit you once a fix is released.

## Supported versions

Security fixes land on the `main` branch. If you self-host, keep your deployment up to date.

## How Costwatch protects data

- **Row Level Security everywhere.** Every table with user data has RLS enabled. Users can only
  reach products they own, and costs, revenue and history only through those products.
- **No service-role key in the app.** The web app uses only the anon/publishable key and the
  signed-in user's session, so the database enforces authorization on every query.
- **Server-side validation.** Every write is validated on the server (zod) and again by database
  constraints. Client-side checks are only for convenience.
- **Session handling** uses HTTP-only cookies managed by `@supabase/ssr`, refreshed by the
  Next.js proxy. Auth redirects accept only same-site relative paths.
- **No financial data in URLs or logs.** Server logs record error codes only, never row data.
- **Hardening headers**: `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, HSTS, and
  `Cache-Control: private, no-store` on all app pages.

## Self-hosting checklist

- Never commit `.env` / `.env.local`, and never put the `service_role` key in `NEXT_PUBLIC_*` variables.
- Configure custom SMTP in Supabase before inviting real users.
- Restrict Supabase auth redirect URLs to your own domains.
- Never load `supabase/seed.sql` into a production project — it creates a demo account with a
  published password.
