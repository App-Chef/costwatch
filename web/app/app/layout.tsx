import type { Metadata } from "next";
import Link from "next/link";
import { signOutAction } from "@/app/actions/account";
import { BottomNav, SidebarNav } from "@/components/app/nav";
import { ProductSwitcher } from "@/components/app/product-switcher";
import { LogoutIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { TimezoneSync } from "@/components/timezone-sync";
import { ToastProvider } from "@/components/ui/toast";
import { requireUser } from "@/lib/data/auth";
import { getActiveProduct, getProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Costwatch" },
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [products, active] = await Promise.all([getProducts(), getActiveProduct()]);
  const switcherProducts = products.map(({ id, name, currency }) => ({ id, name, currency }));

  return (
    <ToastProvider>
      <TimezoneSync />
      <div className="min-h-dvh lg:grid lg:grid-cols-[256px_1fr]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-line bg-sunken/60 px-4 py-5 lg:flex">
          <Link href="/app" className="rounded-md px-1" aria-label="Costwatch overview">
            <Logo />
          </Link>
          <div>
            <p className="mb-1.5 px-1 text-xs font-semibold tracking-wide text-muted uppercase">Product</p>
            <ProductSwitcher products={switcherProducts} activeId={active?.id ?? null} />
          </div>
          <SidebarNav />
          <div className="mt-auto flex flex-col gap-2 border-t border-hairline pt-4">
            <p className="truncate px-1 text-sm text-muted" title={user.email ?? undefined}>
              {user.email}
            </p>
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-sm font-semibold text-ink-2 transition-colors duration-150 hover:bg-card hover:text-ink"
              >
                <LogoutIcon size={16} />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur-sm lg:hidden">
          <Link href="/app" aria-label="Costwatch overview">
            <Logo className="text-base" />
          </Link>
          <ProductSwitcher products={switcherProducts} activeId={active?.id ?? null} compact />
        </header>

        <main id="main" className="min-w-0 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      <BottomNav />
    </ToastProvider>
  );
}
