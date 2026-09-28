import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div>
        <p className="font-mono text-sm font-semibold text-accent-ink">404</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">This page doesn&apos;t exist.</h1>
        <p className="mt-2 text-ink-2">The link may be broken, or the page may have moved.</p>
      </div>
      <Link href="/" className={buttonClass("primary")}>
        Back to Costwatch
      </Link>
    </main>
  );
}
