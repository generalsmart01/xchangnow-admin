import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DetailList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <dl className={cn("divide-y", className)}>{children}</dl>;
}

export function DetailRow({
  label,
  children,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      )}
    >
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium sm:text-right">{children}</dd>
    </div>
  );
}
