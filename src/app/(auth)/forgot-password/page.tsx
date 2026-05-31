"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await forgotPassword(values.email);
      setSent(true);
    } catch (err) {
      // Don't reveal whether the account exists — show the neutral state anyway,
      // but surface genuine server/network errors.
      if (err instanceof ApiError && err.status >= 500) {
        toast.error(err.message);
        return;
      }
      setSent(true);
    }
  }

  if (sent) {
    return (
      <AuthShell
        title="Check your inbox"
        description="If an account exists for that email, we've sent a link to reset your password."
        footer={
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="grid size-11 place-items-center rounded-full bg-success/12 text-success">
            <MailCheck className="size-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            The link expires shortly — check your spam folder if it doesn&apos;t
            arrive.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password"
      description="Enter your email and we'll send a reset link."
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@xchangnow.com"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
