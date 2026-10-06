"use client";

import type { InputHTMLAttributes } from "react";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const control =
  "block w-full rounded-md border border-ink/80 bg-card px-3 text-[15px] text-ink placeholder:text-muted/70 " +
  "transition-[box-shadow,border-color] duration-150 ease-out " +
  "hover:border-ink focus:border-ink focus:shadow-hard-sm focus:outline-none focus-visible:outline-none " +
  "aria-[invalid=true]:border-loss aria-[invalid=true]:shadow-[2px_2px_0_0_var(--color-loss)] " +
  "disabled:cursor-not-allowed disabled:bg-sunken disabled:opacity-70";

export function PasswordInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        className={cn(control, "h-11 pr-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-2 transition-colors duration-150 hover:text-ink focus:text-ink focus:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
      </button>
    </div>
  );
}
