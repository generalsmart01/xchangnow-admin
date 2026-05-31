"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeftRight,
  Check,
  CheckCheck,
  Eye,
  MoreHorizontal,
  X,
} from "lucide-react";

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
import { TransactionStatusBadge } from "./transaction-status-badge";
import { TransactionTypeBadge } from "./transaction-type-badge";
import { ApproveDialog } from "./approve-dialog";
import { RejectDialog } from "./reject-dialog";
import { MarkCompletedDialog } from "./mark-completed-dialog";
import { CryptoDisplay, CurrencyDisplay } from "@/components/shared/currency-display";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { truncateMiddle } from "@/lib/format";
import { assetSymbol } from "@/lib/asset-display";
import type { Transaction } from "@/lib/types/transaction";

type TxDialog = "approve" | "reject" | "complete" | null;

function RowActions({ transaction }: { transaction: Transaction }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<TxDialog>(null);

  const { status, type } = transaction;
  const canApprove = status === "UNDER_REVIEW";
  const canReject =
    status === "UNDER_REVIEW" ||
    status === "PENDING" ||
    status === "AWAITING_PAYMENT";
  const canComplete =
    status === "APPROVED" && (type === "BUY" || type === "SWAP");
  const hasReviewActions = canApprove || canReject || canComplete;

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
            onSelect={() => router.push(`/admin/transactions/${transaction.id}`)}
          >
            <Eye className="size-4" /> View details
          </DropdownMenuItem>
          {hasReviewActions ? (
            <RoleGate cap="transactions.review">
              <DropdownMenuSeparator />
              {canApprove ? (
                <DropdownMenuItem onSelect={() => setDialog("approve")}>
                  <Check className="size-4" /> Approve
                </DropdownMenuItem>
              ) : null}
              {canComplete ? (
                <DropdownMenuItem onSelect={() => setDialog("complete")}>
                  <CheckCheck className="size-4" /> Mark completed
                </DropdownMenuItem>
              ) : null}
              {canReject ? (
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDialog("reject")}
                >
                  <X className="size-4" /> Reject
                </DropdownMenuItem>
              ) : null}
            </RoleGate>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <ApproveDialog
        transaction={transaction}
        open={dialog === "approve"}
        onOpenChange={(o) => setDialog(o ? "approve" : null)}
      />
      <RejectDialog
        transaction={transaction}
        open={dialog === "reject"}
        onOpenChange={(o) => setDialog(o ? "reject" : null)}
      />
      <MarkCompletedDialog
        transaction={transaction}
        open={dialog === "complete"}
        onOpenChange={(o) => setDialog(o ? "complete" : null)}
      />
    </>
  );
}

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
        asset={assetSymbol(row.original.assetNetwork)}
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
  {
    header: "",
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <RowActions transaction={row.original} />
      </div>
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
