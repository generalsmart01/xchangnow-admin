import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-foreground/5 text-foreground ring-foreground/15",
  brand: "bg-primary/10 text-primary ring-primary/25",
  success: "bg-success/12 text-success ring-success/25",
  warning: "bg-warning/15 text-warning-foreground ring-warning/40",
  danger: "bg-destructive/10 text-destructive ring-destructive/25",
  info: "bg-info/10 text-info ring-info/25",
  muted: "bg-muted text-muted-foreground ring-border",
};

type ToneBadgeProps = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
};

/** Soft, ring-outlined status pill driven by a semantic tone. */
export function ToneBadge({ tone = "neutral", children, className, dot }: ToneBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {dot ? (
        <span className="size-1.5 rounded-full bg-current opacity-80" />
      ) : null}
      {children}
    </span>
  );
}
