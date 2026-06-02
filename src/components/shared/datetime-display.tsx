"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { absoluteTime, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type DateTimeDisplayProps = {
  value: string | Date | null | undefined;
  className?: string;
  /** Show relative ("3 hours ago") instead of the absolute date as primary text. */
  relative?: boolean;
};

/** Absolute date + time, with the relative time on hover. */
export function DateTimeDisplay({
  value,
  className,
  relative = false,
}: DateTimeDisplayProps) {
  const absolute = !relative;
  if (!value) return <span className={cn("text-muted-foreground", className)}>—</span>;

  const primary = absolute ? absoluteTime(value) : relativeTime(value);
  const secondary = absolute ? relativeTime(value) : absoluteTime(value);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("whitespace-nowrap", className)}>{primary}</span>
      </TooltipTrigger>
      <TooltipContent>{secondary}</TooltipContent>
    </Tooltip>
  );
}
