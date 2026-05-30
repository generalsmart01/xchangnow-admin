"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  disabled,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 pt-1">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? (
          "No results"
        ) : (
          <>
            Showing <span className="font-medium text-foreground">{from}</span>–
            <span className="font-medium text-foreground">{to}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span>
          </>
        )}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Page {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
