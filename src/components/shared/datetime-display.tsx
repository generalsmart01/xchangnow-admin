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
  /** Show absolute date instead of relative as the primary text. */
  absolute?: boolean;
};

/** Relative time with the absolute timestamp on hover. */
export function DateTimeDisplay({
  value,
  className,
  absolute = false,
}: DateTimeDisplayProps) {
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
