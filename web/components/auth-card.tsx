import type { ReactNode } from "react";
import { InfoIcon } from "@/components/icons";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function AuthCard({ title, description, children, footer }: { title: string; description?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <>
      <div className="rounded-md border border-line bg-card p-6 shadow-hard sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] text-ink-2">{description}</p>}
        {!isSupabaseConfigured() && (
          <p className="mt-4 flex gap-2 rounded-md border border-warn/40 bg-warn-soft px-3 py-2.5 text-sm text-warn" role="note">
            <InfoIcon size={16} className="mt-0.5 shrink-0" />
            <span>
              Supabase isn&apos;t configured yet. Set <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> — see the setup guide at /docs.
            </span>
          </p>
        )}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="mt-5 text-center text-sm text-ink-2">{footer}</p>}
    </>
  );
}
