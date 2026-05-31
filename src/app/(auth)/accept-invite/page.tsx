"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/lib/api/account";

function AcceptInvite() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";

  if (!token) {
    return (
      <AuthShell
        title="Invalid invite link"
        description="This link is missing its token. Ask an admin to resend your invite."
        footer={
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        <Button asChild className="w-full">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Accept your invite"
      description="Set a password to activate your staff account."
      footer={
        <>
          Already set up?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SetPasswordForm
        submitLabel="Activate account"
        submit={(password) => acceptInvite({ token, password })}
        onSuccess={() => {
          toast.success("Account activated — please sign in.");
          router.replace("/login");
        }}
      />
    </AuthShell>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AcceptInvite />
    </Suspense>
  );
}
