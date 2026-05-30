import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import type { LucideProps } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Tone } from "./tone-badge";

const ICON_TONE: Record<Tone, string> = {
  neutral: "bg-foreground/5 text-foreground",
  brand: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning-foreground",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  muted: "bg-muted text-muted-foreground",
};

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon: ComponentType<LucideProps>;
  tone?: Tone;
  hint?: string;
  href?: string;
  loading?: boolean;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
  href,
  loading,
}: StatCardProps) {
  const body = (
    <Card className={cn("transition-shadow", href && "hover:shadow-md")}>
      <CardContent className="flex items-center gap-4 py-5">
        <div className={cn("grid size-11 place-items-center rounded-lg", ICON_TONE[tone])}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
          )}
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
