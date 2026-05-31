"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, Banknote, Eye, MoreHorizontal } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleGate } from "@/components/layout/role-gate";
import { PayoutStatusBadge } from "./payout-status-badge";
import {
  PAYOUT_TRANSITIONS,
  UpdateStatusDialog,
} from "./update-status-dialog";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { titleCase } from "@/lib/labels";
import type { Payout, PayoutStatus } from "@/lib/types/payout";

function RowActions({ payout }: { payout: Payout }) {
  const router = useRouter();
  const [target, setTarget] = useState<PayoutStatus | null>(null);
  const transitions = PAYOUT_TRANSITIONS[payout.status];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Open actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onSelect={() => router.push(`/admin/payouts/${payout.id}`)}
          >
            <Eye className="size-4" /> View details
          </DropdownMenuItem>
          {transitions.length > 0 ? (
            <RoleGate cap="payouts.updateStatus">
              <DropdownMenuSeparator />
              {transitions.map((t) => (
                <DropdownMenuItem
                  key={t}
                  variant={t === "FAILED" ? "destructive" : undefined}
                  onSelect={() => setTarget(t)}
                >
                  <ArrowRight className="size-4" /> Mark {titleCase(t)}
                </DropdownMenuItem>
              ))}
            </RoleGate>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {target ? (
        <UpdateStatusDialog
          payout={payout}
          target={target}
          open
          onOpenChange={(o) => {
            if (!o) setTarget(null);
          }}
        />
      ) : null}
    </>
  );
}

const columns: ColumnDef<Payout>[] = [
  {
    header: "Reference",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">{row.original.reference}</span>
    ),
  },
  {
    header: "Beneficiary",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm">{row.original.bankAccount?.accountName ?? "—"}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.bankAccount?.bankName ?? ""}
        </span>
      </div>
    ),
  },
  {
    header: "Account",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.bankAccount?.accountNumber ?? "—"}
      </span>
    ),
  },
  {
    header: "Amount",
    cell: ({ row }) => (
      <CurrencyDisplay
        amount={row.original.amount}
        currency={row.original.currency}
        className="text-sm font-medium"
      />
    ),
  },
  {
    header: "Status",
    cell: ({ row }) => <PayoutStatusBadge status={row.original.status} />,
  },
  {
    header: "Paid",
    cell: ({ row }) =>
      row.original.paidAt ? (
        <DateTimeDisplay
          value={row.original.paidAt}
          className="text-sm text-muted-foreground"
        />
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    header: "",
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <RowActions payout={row.original} />
      </div>
    ),
  },
];

export function PayoutsTable({
  payouts,
  loading,
}: {
  payouts: Payout[];
  loading?: boolean;
}) {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      data={payouts}
      loading={loading}
      getRowId={(p) => p.id}
      onRowClick={(p) => router.push(`/admin/payouts/${p.id}`)}
      emptyState={
        <EmptyState
          icon={Banknote}
          title="No payouts found"
          description="Try adjusting your filters."
          className="border-0 py-12"
        />
      }
    />
  );
}
