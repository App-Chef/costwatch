import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DeletedNotice } from "@/components/marketing/deleted-notice";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { CostsIcon, GithubIcon, RenewalsIcon, RevenueIcon, OverviewIcon } from "@/components/icons";
import { buttonClass } from "@/components/ui/button";
import { GITHUB_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: { absolute: "Costwatch | Know what your product actually costs" },
  description: "Track your product costs, revenue, renewals, and profit in one place.",
  alternates: { canonical: "/" },
};

const PROBLEM = [
  { item: "A hosting bill.", example: "$20" },
  { item: "A database.", example: "$25" },
  { item: "An API.", example: "$32" },
  { item: "A domain.", example: "$1" },
  { item: "Email.", example: "$6" },
  { item: "Design tools.", example: "$15" },
  { item: "Other subscriptions.", example: "$28" },
];

const FEATURES = [
  {
    icon: CostsIcon,
    title: "Track costs",
    body: "Every service, subscription and one-off expense behind your product. Monthly, quarterly, yearly or custom billing — all converted to a clear monthly estimate.",
  },
  {
    icon: RevenueIcon,
    title: "Track revenue",
    body: "Enter what your product earns in a few seconds. No payment processor connection required, nothing synced without you knowing.",
  },
  {
    icon: RenewalsIcon,
    title: "Watch renewals",
    body: "See what's about to charge you in the next 7, 30 or 90 days, before the yearly domain renewal surprises you.",
  },
  {
    icon: OverviewIcon,
    title: "Understand profit",
    body: "Revenue minus operating cost, and the margin behind it. Plus which costs are growing, and where the money goes by category.",
  },
];

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <DeletedNotice />
      </Suspense>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-sm border border-line bg-card px-2.5 py-1 text-xs font-semibold">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Open source · Self-hostable
          </p>
          <h1 className="text-[2.75rem] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance sm:text-7xl">
            Know what your product <span className="relative whitespace-nowrap">
              <span className="relative z-10">actually costs.</span>
              <span className="absolute inset-x-0 bottom-[0.08em] -z-0 h-[0.28em] bg-accent/80" aria-hidden="true" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl">
            Track your software costs, revenue, renewals, and profit in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className={buttonClass("primary", "lg")}>
              Start tracking
            </Link>
            <a href={GITHUB_URL} className={buttonClass("secondary", "lg")}>
              <GithubIcon />
              View GitHub
            </a>
          </div>
          <p className="mt-6 text-sm text-muted">Stop guessing what your side project costs every month.</p>
        </div>
      </section>

      {/* Dashboard preview */}
      <section aria-label="Dashboard preview" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <DashboardPreview />
      </section>

      {/* Problem */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold text-accent-ink">The problem</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Your product may have:</h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-2">
              Individually, they look small. <strong className="text-ink">Together, they become your operating cost.</strong> And
              they&apos;re scattered across a dozen dashboards, invoices and card statements.
            </p>
          </div>
          <div className="rounded-md border border-line bg-paper p-5 font-mono text-sm shadow-hard sm:p-6" aria-label="Example list of monthly costs">
            <ul className="flex flex-col">
              {PROBLEM.map((p) => (
                <li key={p.item} className="flex items-baseline justify-between gap-4 border-b border-dashed border-hairline py-2">
                  <span className="font-sans text-[15px]">{p.item}</span>
                  <span className="tabular text-muted">{p.example}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-baseline justify-between border-t-2 border-ink pt-3">
              <span className="font-sans text-[15px] font-bold">Every month</span>
              <span className="tabular text-xl font-semibold">$127</span>
            </div>
            <p className="mt-3 font-sans text-xs text-muted">Example amounts.</p>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-ink">The fix</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">One place for every cost behind your product.</h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-2">
            Costwatch brings your hosting, databases, APIs, domains and subscriptions together with the revenue they support. Open your
            dashboard and in a few seconds you know what you&apos;re paying for, what you&apos;re making, and what&apos;s left.
          </p>
        </div>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["01", "Add what you pay for", "Name, amount, billing cycle. Costwatch works out the monthly equivalent."],
            ["02", "Record what you earn", "Manual entries, grouped by month. Takes seconds."],
            ["03", "Read your numbers", "Monthly cost, profit, margin and upcoming renewals — per product."],
          ].map(([n, title, body]) => (
            <li key={n} className="rounded-md border border-line bg-card p-5">
              <span className="font-mono text-sm font-semibold text-accent-ink">{n}</span>
              <h3 className="mt-3 text-lg font-bold tracking-tight">{title}</h3>
              <p className="mt-1.5 text-[15px] text-ink-2">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-t border-line bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Everything you need. Nothing you don&apos;t.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-md border border-line bg-paper p-6 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard"
              >
                <div className="grid size-10 place-items-center rounded-md border border-line bg-card transition-colors duration-200 group-hover:bg-accent-soft">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-xl font-bold tracking-tight">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-sm text-muted">
            Costwatch is not accounting software. No invoicing, taxes or bank connections — just a clear view of what your product costs to run.
          </p>
        </div>
      </section>

      {/* Open source */}
      <section className="border-t border-line bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold text-accent">Open source</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Your numbers. Your database.</h2>
            <p className="mt-5 text-lg leading-relaxed text-paper/80">
              Costwatch is MIT licensed. Run it on your own Supabase project and your financial data never leaves infrastructure you
              control. Every row is protected by Postgres Row Level Security.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={GITHUB_URL} className={buttonClass("accent", "lg")}>
                <GithubIcon />
                Star on GitHub
              </a>
              <Link
                href="/docs"
                className="inline-flex h-12 items-center rounded-md border border-paper/40 px-6 font-semibold text-paper transition-colors duration-150 hover:border-paper hover:bg-paper/10"
              >
                Self-hosting guide
              </Link>
            </div>
          </div>
          <pre className="overflow-x-auto rounded-md border border-paper/25 bg-[#1b1b1a] p-5 font-mono text-[13px] leading-7 text-paper/90" aria-label="Setup commands">
            <code>
              <span className="text-paper/40">$ </span>git clone {GITHUB_URL}.git{"\n"}
              <span className="text-paper/40">$ </span>cd costwatch/web && npm install{"\n"}
              <span className="text-paper/40">$ </span>cp .env.example .env.local{"\n"}
              <span className="text-paper/40">$ </span>npx supabase db push{"\n"}
              <span className="text-paper/40">$ </span>npm run dev{"\n"}
              <span className="text-accent">✓ Ready on http://localhost:3000</span>
            </code>
          </pre>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl">Know your numbers.</h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-ink-2">Set up your first product in under five minutes.</p>
        <Link href="/signup" className={buttonClass("primary", "lg", "mt-8")}>
          Start tracking
        </Link>
      </section>
    </>
  );
}
