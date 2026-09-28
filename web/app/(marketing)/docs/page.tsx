import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GITHUB_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Self-hosting guide",
  description: "Run Costwatch on your own Supabase project: setup, environment variables, authentication and deployment.",
  alternates: { canonical: "/docs" },
};

const SECTIONS = [
  ["requirements", "Requirements"],
  ["supabase", "1. Create a Supabase project"],
  ["database", "2. Set up the database"],
  ["env", "3. Environment variables"],
  ["auth", "4. Configure authentication"],
  ["run", "5. Run it"],
  ["deploy", "6. Deploy"],
  ["calculations", "How the numbers work"],
  ["scope", "What Costwatch is not"],
] as const;

function Code({ children }: { children: ReactNode }) {
  return (
    <pre className="my-4 overflow-x-auto rounded-md border border-line bg-ink p-4 font-mono text-[13px] leading-6 text-paper">
      <code>{children}</code>
    </pre>
  );
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-sm border border-hairline bg-card px-1 py-0.5 font-mono text-[0.85em]">{children}</code>;
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-hairline pt-10">
      <h2 id={`${id}-title`} className="text-2xl font-extrabold tracking-tight">
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-ink-2 [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block">
        <nav aria-label="On this page" className="sticky top-24">
          <p className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">On this page</p>
          <ul className="flex flex-col gap-1.5 text-sm">
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="text-ink-2 transition-colors duration-150 hover:text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <article className="max-w-3xl">
        <p className="text-sm font-semibold text-accent-ink">Documentation</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Self-hosting guide</h1>
        <p className="mt-4 text-lg text-ink-2">
          Costwatch is a Next.js app backed by Supabase (Postgres, Auth and Row Level Security). There is no other server to run. This
          guide takes you from a fresh clone to a deployed instance.
        </p>

        <div className="mt-10 flex flex-col gap-10">
          <Section id="requirements" title="Requirements">
            <ul>
              <li>Node.js 20.9 or newer</li>
              <li>A Supabase project (the free tier is enough), or the Supabase CLI with Docker for a fully local setup</li>
            </ul>
          </Section>

          <Section id="supabase" title="1. Create a Supabase project">
            <p>
              Create a project at <a className="font-semibold text-ink underline underline-offset-4" href="https://supabase.com/dashboard">supabase.com</a>. From{" "}
              <strong>Project Settings → API</strong>, copy the <strong>Project URL</strong> and the <strong>anon / publishable key</strong>.
            </p>
            <p>
              You will never need the <C>service_role</C> key. Costwatch talks to the database only as the signed-in user, so Row Level
              Security is always enforced.
            </p>
          </Section>

          <Section id="database" title="2. Set up the database">
            <p>Clone the repository and push the migrations with the Supabase CLI:</p>
            <Code>
              {`git clone ${GITHUB_URL}.git
cd costwatch
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push`}
            </Code>
            <p>
              Prefer not to use the CLI? Open the SQL editor in the Supabase dashboard and run each file in <C>supabase/migrations</C> in
              order.
            </p>
            <p>
              For a local database instead, run <C>npx supabase start</C> and then <C>npx supabase db reset</C>. That also loads{" "}
              <C>supabase/seed.sql</C>: a demo account (<C>demo@example.com</C> / <C>costwatch-demo</C>) with made-up example data.
              Never load the seed into a production project.
            </p>
          </Section>

          <Section id="env" title="3. Environment variables">
            <p>
              Copy <C>web/.env.example</C> to <C>web/.env.local</C> and fill it in:
            </p>
            <Code>
              {`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=false`}
            </Code>
            <ul>
              <li>
                <C>NEXT_PUBLIC_SITE_URL</C> is used for auth email links, the sitemap and social previews. Set it to your public URL in
                production.
              </li>
              <li>
                <C>NEXT_PUBLIC_AUTH_GOOGLE_ENABLED</C> shows the Google button. Only turn it on after configuring the provider (below).
              </li>
            </ul>
          </Section>

          <Section id="auth" title="4. Configure authentication">
            <p>
              In <strong>Authentication → URL Configuration</strong>, set the <strong>Site URL</strong> to your public URL and add these{" "}
              <strong>Redirect URLs</strong>:
            </p>
            <Code>
              {`http://localhost:3000/auth/callback
https://your-domain.com/auth/callback`}
            </Code>
            <p>
              Email/password and magic links work out of the box. Supabase&apos;s built-in email sender is heavily rate limited, so
              configure a custom SMTP provider before inviting real users.
            </p>
            <p>
              <strong>Google (optional):</strong> create an OAuth client in Google Cloud Console with the authorized redirect URI shown in{" "}
              <strong>Authentication → Providers → Google</strong>, paste the client ID and secret there, then set{" "}
              <C>NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true</C>.
            </p>
          </Section>

          <Section id="run" title="5. Run it">
            <Code>
              {`cd web
npm install
npm run dev`}
            </Code>
            <p>
              Open <C>http://localhost:3000</C>, create an account and add your first product.
            </p>
          </Section>

          <Section id="deploy" title="6. Deploy">
            <p>
              Any host that runs Next.js works. On Vercel, import the repository, set the <strong>root directory</strong> to <C>web</C>,
              add the environment variables above, and deploy. Remember to add your production <C>/auth/callback</C> URL to Supabase.
            </p>
          </Section>

          <Section id="calculations" title="How the numbers work">
            <ul>
              <li>
                <strong>Monthly cost</strong> is an estimate: the monthly equivalent of every <em>active</em> recurring cost. Yearly
                costs are divided by 12, quarterly by 3, and custom intervals by their length in months (using 365.25 days per year).
              </li>
              <li>
                <strong>One-time costs</strong> are shown separately and are not part of the monthly cost.
              </li>
              <li>
                <strong>Paused</strong> and <strong>inactive</strong> costs are kept but not counted.
              </li>
              <li>
                <strong>Estimated profit</strong> = revenue recorded this month − monthly cost.{" "}
                <strong>Profit margin</strong> = profit ÷ revenue × 100. With no revenue, no margin is shown.
              </li>
              <li>
                <strong>Currencies are never converted.</strong> Each product has a primary currency; costs and revenue in other currencies
                are listed but left out of totals, with a note saying so.
              </li>
              <li>
                <strong>Renewals</strong> use the next renewal date you enter. If that date has passed, Costwatch projects the next one
                from your billing cycle and marks it as estimated.
              </li>
              <li>
                <strong>Cost history</strong> is recorded automatically whenever a cost&apos;s price, billing cycle or status changes.
              </li>
            </ul>
          </Section>

          <Section id="scope" title="What Costwatch is not">
            <p>
              Costwatch answers one question: <strong>how much does my product actually cost me?</strong> It is not accounting software.
              It does not do invoicing, taxes, payroll or bank connections, and nothing in it is financial advice.
            </p>
          </Section>
        </div>
      </article>
    </div>
  );
}
