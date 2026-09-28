import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { SignUpForm } from "@/components/forms/auth-forms";
import { googleAuthEnabled } from "@/lib/features";

export const metadata: Metadata = { title: "Create an account", description: "Start tracking what your product costs." };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Start tracking"
      description="Free and open source. Your numbers stay private."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ink underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm google={googleAuthEnabled} />
    </AuthCard>
  );
}
