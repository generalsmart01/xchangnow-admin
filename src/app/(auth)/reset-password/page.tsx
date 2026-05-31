"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/api/account";

function ResetPassword() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";

  if (!token) {
    return (
      <AuthShell
        title="Invalid reset link"
        description="This link is missing its token. Request a new password reset."
        footer={
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        <Button asChild className="w-full">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Choose a new password for your account."
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <SetPasswordForm
        submitLabel="Reset password"
        submit={(password) => resetPassword({ token, password })}
        onSuccess={() => {
          toast.success("Password reset — please sign in.");
          router.replace("/login");
        }}
      />
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResetPassword />
    </Suspense>
  );
}
