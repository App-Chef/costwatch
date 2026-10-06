"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CostsIcon, OverviewIcon, RenewalsIcon, RevenueIcon, SettingsIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export const NAV = [
  { href: "/app", label: "Overview", icon: OverviewIcon },
  { href: "/app/costs", label: "Costs", icon: CostsIcon },
  { href: "/app/revenue", label: "Revenue", icon: RevenueIcon },
  { href: "/app/renewals", label: "Renewals", icon: RenewalsIcon },
  { href: "/app/settings", label: "Settings", icon: SettingsIcon },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ hasProducts = true }: { hasProducts?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          // Hide non-Overview and non-Settings links when user has no products
          if (!hasProducts && href !== "/app" && href !== "/app/settings") {
            return null;
          }
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex h-10 items-center gap-3 rounded-md border px-3 text-[15px] font-semibold transition-[background-color,border-color,box-shadow] duration-150 ease-out",
                  active ? "border-line bg-card shadow-hard-sm" : "border-transparent text-ink-2 hover:bg-card hover:text-ink",
                )}
              >
                <Icon className={active ? "text-accent" : "text-muted group-hover:text-ink"} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNav({ hasProducts = true }: { hasProducts?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          // Hide non-Overview and non-Settings links when user has no products
          if (!hasProducts && href !== "/app" && href !== "/app/settings") {
            return null;
          }
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors duration-150",
                  active ? "text-ink" : "text-muted",
                )}
              >
                <span className={cn("grid h-7 w-11 place-items-center rounded-md border transition-colors duration-150", active ? "border-line bg-accent-soft" : "border-transparent")}>
                  <Icon size={19} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
