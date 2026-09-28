# Self-hosting Costwatch

Costwatch is a Next.js app and a Supabase project. There's nothing else to run.

## 1. Create a Supabase project

Create a project at https://supabase.com/dashboard and copy the **Project URL** and the
**anon / publishable key** from *Project Settings → API*. You never need the `service_role` key.

## 2. Set up the database

```bash
git clone https://github.com/App-Chef/costwatch.git
cd costwatch
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Without the CLI, run each file in `supabase/migrations/` in order in the SQL editor.
Never load `supabase/seed.sql` into production: it creates a demo account with a public password.

## 3. Configure authentication

In *Authentication → URL Configuration*:

- **Site URL**: your public URL, e.g. `https://costwatch.example.com`
- **Redirect URLs**: `https://costwatch.example.com/auth/callback` (plus
  `http://localhost:3000/auth/callback` for local development)

Set up custom SMTP (*Authentication → Emails*) before inviting real users.

**Google sign-in (optional):** create an OAuth client in Google Cloud Console using the
callback URL shown in *Authentication → Providers → Google*, paste the credentials there, and set
`NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true`.

If you customise email templates to use token hashes, link them to
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/app`.

## 4. Deploy the web app

On Vercel (or any Node.js host):

- Root directory: `web`
- Environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon or publishable key>
NEXT_PUBLIC_SITE_URL=https://costwatch.example.com
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=false
```

Then `npm run build && npm start`, or let your host do it.

## Updating

Pull the latest code, run `npx supabase db push` to apply new migrations, and redeploy.
