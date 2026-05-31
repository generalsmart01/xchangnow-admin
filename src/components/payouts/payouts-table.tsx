"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Banknote } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PayoutStatusBadge } from "./payout-status-badge";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import type { Payout } from "@/lib/types/payout";

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
