"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

const ALL = "__all__";

type SelectFilterProps = {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  /** Label for the "no filter" option. */
  allLabel?: string;
  className?: string;
};

/** Select whose first option clears the filter (maps to ""). */
export function SelectFilter({
  value,
  onChange,
  options,
  placeholder = "All",
  allLabel = "All",
  className,
}: SelectFilterProps) {
  return (
    <Select
      value={value === "" ? ALL : value}
      onValueChange={(v) => onChange(v === ALL ? "" : v)}
    >
      <SelectTrigger className={cn("h-9 w-[180px]", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
};

/** Debounced search box. Commits the value after the user stops typing. */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
  debounceMs = 400,
}: SearchInputProps) {
  const [local, setLocal] = useState(value);

  // Keep local state in sync when the committed value changes externally.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => onChange(local), debounceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local, debounceMs]);

  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-8 pr-8"
      />
      {local ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
          onClick={() => {
            setLocal("");
            onChange("");
          }}
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
