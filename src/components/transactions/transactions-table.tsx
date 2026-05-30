"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { TransactionStatusBadge } from "./transaction-status-badge";
import { TransactionTypeBadge } from "./transaction-type-badge";
import { CryptoDisplay, CurrencyDisplay } from "@/components/shared/currency-display";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { truncateMiddle } from "@/lib/format";
import type { Transaction } from "@/lib/types/transaction";
import { ArrowLeftRight } from "lucide-react";

const columns: ColumnDef<Transaction>[] = [
  {
    header: "Reference",
    accessorKey: "referenceCode",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">
        {row.original.referenceCode}
      </span>
    ),
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => <TransactionTypeBadge type={row.original.type} />,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => <TransactionStatusBadge status={row.original.status} />,
  },
  {
    header: "Customer",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.user?.email ?? (
          <span className="font-mono text-xs text-muted-foreground">
            {truncateMiddle(row.original.userId)}
          </span>
        )}
      </span>
    ),
  },
  {
    header: "Crypto",
    cell: ({ row }) => (
      <CryptoDisplay
        amount={row.original.cryptoAmount}
        asset={row.original.cryptoAsset}
        className="text-sm"
      />
    ),
  },
  {
    header: "Fiat",
    cell: ({ row }) => (
      <CurrencyDisplay
        amount={row.original.fiatAmount}
        currency={row.original.fiatCurrency}
        className="text-sm font-medium"
      />
    ),
  },
  {
    header: "Created",
    cell: ({ row }) => (
      <DateTimeDisplay
        value={row.original.createdAt}
        className="text-sm text-muted-foreground"
      />
    ),
  },
];

export function TransactionsTable({
  transactions,
  loading,
}: {
  transactions: Transaction[];
  loading?: boolean;
}) {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      data={transactions}
      loading={loading}
      getRowId={(t) => t.id}
      onRowClick={(t) => router.push(`/admin/transactions/${t.id}`)}
      emptyState={
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions found"
          description="Try adjusting your filters."
          className="border-0 py-12"
        />
      }
    />
  );
}
