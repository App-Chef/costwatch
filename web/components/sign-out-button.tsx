"use client";

import { useState, useTransition } from "react";
import { signOutAction } from "@/app/actions/account";
import { LogoutIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

type SignOutButtonProps = {
  variant?: "default" | "ghost" | "sidebar";
  className?: string;
};

export function SignOutButton({ variant = "default", className }: SignOutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className={cn(
          variant === "ghost" && "inline-flex h-11 items-center gap-2 rounded-md px-3 font-semibold text-ink transition-colors duration-150 hover:bg-sunken",
          variant === "sidebar" && "flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-sm font-semibold text-ink-2 transition-colors duration-150 hover:bg-card hover:text-ink",
          variant === "default" && "inline-flex items-center gap-2",
          className
        )}
      >
        <LogoutIcon size={16} />
        Sign out
      </button>

      <Dialog
        open={showConfirm}
        onClose={() => !pending && setShowConfirm(false)}
        title="Sign out?"
        description="Are you sure you want to sign out of your account?"
        size="sm"
      >
        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowConfirm(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSignOut}
            disabled={pending}
          >
            {pending ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
