"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { isAdminRole } from "@/lib/auth/rbac";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

/** Map known backend 401 messages to friendly copy. */
function friendlyError(err: ApiError): string {
  const m = err.message ?? "";
  if (m.includes("Email or password")) return "Wrong email or password.";
  if (m.includes("verify your email"))
    return "Please verify your email before logging in.";
  if (m.includes("not active"))
    return "Account suspended — contact support.";
  if (m.includes("Too many failed"))
    return "Too many failed attempts. Please try again later.";
  return m || "Unable to sign in. Please try again.";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      const { user } = await login(values.email, values.password);
      if (!isAdminRole(user.role)) {
        setFormError("This console is for staff accounts only.");
        return;
      }
      const from = searchParams.get("from");
      router.replace(from && from.startsWith("/admin") ? from : "/admin");
    } catch (err) {
      if (err instanceof ApiError) setFormError(friendlyError(err));
      else setFormError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            X
          </span>
          {APP_NAME}
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold leading-snug">
            Operate the exchange with confidence.
          </h2>
          <p className="max-w-md text-sm text-sidebar-foreground/70">
            Review transactions, process payouts, manage KYC and keep rates
            current — all from one secure console. Every sensitive action is
            audited.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">
          © {APP_NAME} • Internal staff access only
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 lg:hidden">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                X
              </span>
              {APP_NAME}
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              {APP_TAGLINE} — enter your staff credentials.
            </p>
          </div>

          {formError ? (
            <Alert variant="destructive">
              <ShieldCheck className="size-4" />
              <AlertTitle>Could not sign in</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
