import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { UpdatePasswordForm } from "@/components/forms/auth-forms";
import { requireUser } from "@/lib/data/auth";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default async function UpdatePasswordPage() {
  await requireUser();
  return (
    <AuthCard title="Choose a new password">
      <UpdatePasswordForm />
    </AuthCard>
  );
}
