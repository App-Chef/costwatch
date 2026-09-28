"use client";

import { AlertIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card raised className="mx-auto mt-6 max-w-lg p-6">
      <div className="mb-4 grid size-10 place-items-center rounded-md border border-line bg-loss-soft text-loss">
        <AlertIcon />
      </div>
      <h1 className="text-xl font-bold tracking-tight">Something went wrong.</h1>
      <p className="mt-2 text-[15px] text-ink-2">
        We couldn&apos;t load this page. Your data is safe — please try again. If it keeps happening, check that your Supabase project is
        reachable.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </Card>
  );
}
