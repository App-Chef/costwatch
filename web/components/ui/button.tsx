import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md border font-semibold " +
  "transition-[transform,box-shadow,background-color,color] duration-150 ease-out " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-line bg-ink text-white shadow-[2px_2px_0_0_var(--color-accent)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--color-accent)] active:translate-x-px active:translate-y-px active:shadow-none",
  accent:
    "border-line bg-accent text-ink shadow-hard-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-hard active:translate-x-px active:translate-y-px active:shadow-none",
  secondary:
    "border-line bg-card text-ink shadow-hard-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-hard active:translate-x-px active:translate-y-px active:shadow-none",
  ghost: "border-transparent bg-transparent text-ink hover:bg-sunken",
  danger:
    "border-loss bg-card text-loss shadow-[2px_2px_0_0_var(--color-loss)] hover:bg-loss hover:text-white active:translate-x-px active:translate-y-px active:shadow-none",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}
