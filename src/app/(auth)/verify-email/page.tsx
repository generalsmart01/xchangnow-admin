"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";

type State =
  | { kind: "verifying" }
  | { kind: "success" }
  | { kind: "error"; message: string };

function VerifyEmail() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<State>(
    token ? { kind: "verifying" } : { kind: "error", message: "This link is missing its token." },
  );
  // Guard against React strict-mode running the effect twice.
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verifyEmail(token)
      .then(() => setState({ kind: "success" }))
      .catch((err) =>
        setState({
          kind: "error",
          message:
            err instanceof ApiError
              ? err.message
              : "We couldn't verify your email. The link may have expired.",
        }),
      );
  }, [token]);

  if (state.kind === "verifying") {
    return (
      <AuthShell title="Verifying your email" description="This will only take a moment.">
        <div className="flex justify-center py-4">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AuthShell>
    );
  }

  if (state.kind === "success") {
    return (
      <AuthShell
        title="Email verified"
        description="Your email is confirmed. You can now sign in."
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="grid size-11 place-items-center rounded-full bg-success/12 text-success">
            <CheckCircle2 className="size-5" />
          </div>
          <Button asChild className="w-full">
            <Link href="/login">Continue to sign in</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verification failed"
      description={state.message}
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="size-5" />
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <VerifyEmail />
    </Suspense>
  );
}
