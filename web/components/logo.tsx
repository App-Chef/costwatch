import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="#121212" />
      <rect x="7" y="17" width="4.5" height="8" rx="1" fill="#f6f5f0" />
      <rect x="13.75" y="12" width="4.5" height="13" rx="1" fill="#f6f5f0" />
      <rect x="20.5" y="7" width="4.5" height="18" rx="1" fill="#e8590c" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[17px] font-extrabold tracking-tight", className)}>
      <LogoMark />
      Costwatch
    </span>
  );
}
