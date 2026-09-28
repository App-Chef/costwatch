import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { SignInForm } from "@/components/forms/auth-forms";
import { FormMessage } from "@/components/ui/field";
import { googleAuthEnabled } from "@/lib/features";
import { safeNextPath } from "@/lib/redirects";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to Costwatch." };

const ERRORS: Record<string, string> = {
  link: "That link is invalid or has expired. Request a new one below.",
  oauth: "We couldn't start Google sign-in. Try again or use your email.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to see what your product costs."
      footer={
        <>
          New to Costwatch?{" "}
          <Link href="/signup" className="font-semibold text-ink underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4">
          <FormMessage>{error}</FormMessage>
        </div>
      )}
      <SignInForm next={next} google={googleAuthEnabled} />
    </AuthCard>
  );
}
