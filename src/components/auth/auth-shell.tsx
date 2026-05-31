import type { ReactNode } from "react";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";

/** Centered, branded shell for the public auth flows (invite, verify, reset). */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            X
          </span>
          {APP_NAME}
        </div>

        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {children}
          </CardContent>
        </Card>

        {footer ? (
          <p className="text-center text-sm text-muted-foreground">{footer}</p>
        ) : null}
      </div>
    </div>
  );
}
