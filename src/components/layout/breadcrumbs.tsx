"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { truncateMiddle } from "@/lib/format";

const LABELS: Record<string, string> = {
  admin: "Dashboard",
  users: "Users",
  transactions: "Transactions",
  payouts: "Payouts",
  kyc: "KYC",
  rates: "Rates",
  wallets: "Wallets",
  staff: "Staff",
  settings: "Settings",
  new: "New",
  invite: "Invite",
};

function labelFor(segment: string): string {
  if (LABELS[segment]) return LABELS[segment];
  // Looks like an id/cuid/hash — truncate for readability.
  if (segment.length > 14 || /^[a-z0-9]{16,}$/i.test(segment)) {
    return truncateMiddle(segment, 6, 4);
  }
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // ["admin", ...]

  const crumbs = segments.map((segment, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    return { href, label: labelFor(segment), last: i === segments.length - 1 };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {crumbs.map((c) => (
        <Fragment key={c.href}>
          {c.last ? (
            <span className="font-medium text-foreground">{c.label}</span>
          ) : (
            <Link
              href={c.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {c.label}
            </Link>
          )}
          {!c.last ? (
            <ChevronRight className="size-3.5 text-muted-foreground/50" />
          ) : null}
        </Fragment>
      ))}
    </nav>
  );
}
