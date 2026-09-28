import Link from "next/link";
import { GithubIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";
import { GITHUB_URL } from "@/lib/constants";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Costwatch home" className="rounded-md">
            <Logo />
          </Link>
          <nav aria-label="Site" className="flex items-center gap-1 sm:gap-2">
            <Link href="/#features" className="hidden rounded-md px-3 py-2 text-sm font-semibold text-ink-2 transition-colors duration-150 hover:text-ink md:block">
              Features
            </Link>
            <Link href="/docs" className="hidden rounded-md px-3 py-2 text-sm font-semibold text-ink-2 transition-colors duration-150 hover:text-ink sm:block">
              Docs
            </Link>
            <a
              href={GITHUB_URL}
              className="grid size-9 place-items-center rounded-md text-ink-2 transition-colors duration-150 hover:bg-sunken hover:text-ink"
              aria-label="Costwatch on GitHub"
            >
              <GithubIcon />
            </a>
            <Link href="/login" className="rounded-md px-3 py-2 text-sm font-semibold text-ink-2 transition-colors duration-150 hover:text-ink">
              Sign in
            </Link>
            <Link href="/signup" className={buttonClass("primary", "sm", "hidden sm:inline-flex")}>
              Start tracking
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-ink-2">
              A product cost visibility tool for indie developers. Not accounting software, and not financial advice.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            <Link href="/docs" className="text-ink-2 hover:text-ink">Self-hosting guide</Link>
            <a href={GITHUB_URL} className="text-ink-2 hover:text-ink">GitHub</a>
            <Link href="/docs#calculations" className="text-ink-2 hover:text-ink">How numbers work</Link>
            <a href={`${GITHUB_URL}/blob/main/LICENSE`} className="text-ink-2 hover:text-ink">MIT License</a>
            <Link href="/login" className="text-ink-2 hover:text-ink">Sign in</Link>
            <a href={`${GITHUB_URL}/blob/main/SECURITY.md`} className="text-ink-2 hover:text-ink">Security</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
