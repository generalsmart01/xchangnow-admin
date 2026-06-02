"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Eye, IdCard, MoreHorizontal, XCircle } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleGate } from "@/components/layout/role-gate";
import { KycStatusBadge } from "./kyc-status-badge";
import { KycRejectDialog } from "./kyc-reject-dialog";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { approveKyc } from "@/lib/api/kyc";
import { fullName } from "@/lib/format";
import { smartLabel } from "@/lib/labels";
import type { KycReviewResult, KycSubmission } from "@/lib/types/kyc";

function RowActions({ submission }: { submission: KycSubmission }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);
  const isPending = submission.kycStatus === "PENDING";

  const approve = useMutationToast<KycReviewResult, void>(
    () => approveKyc(submission.userId).then((r) => r.data),
    {
      successMessage: "KYC submission approved",
      invalidate: [["kyc"], ["kyc", submission.userId], ["dashboard"]],
      onSuccess: () => setDialog(null),
    },
  );

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
            onSelect={() => router.push(`/admin/kyc/${submission.userId}`)}
          >
            <Eye className="size-4" /> View details
          </DropdownMenuItem>
          {isPending ? (
            <RoleGate cap="kyc.review">
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setDialog("approve")}>
                <CheckCircle2 className="size-4" /> Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDialog("reject")}
              >
                <XCircle className="size-4" /> Reject
              </DropdownMenuItem>
            </RoleGate>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={dialog === "approve"}
        onOpenChange={(o) => setDialog(o ? "approve" : null)}
        title="Approve KYC submission"
        description="Confirm the identity documents match the customer's profile."
        confirmText="Approve"
        loading={approve.isPending}
        onConfirm={() => approve.mutate()}
      />
      <KycRejectDialog
        userId={submission.userId}
        open={dialog === "reject"}
        onOpenChange={(o) => setDialog(o ? "reject" : null)}
      />
    </>
  );
}

const columns: ColumnDef<KycSubmission>[] = [
  {
    header: "Applicant",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{fullName(row.original.user)}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.user?.email ?? "—"}
        </span>
      </div>
    ),
  },
  {
    header: "Document",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm">{smartLabel(row.original.documentType)}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.documentNumber ?? "—"}
        </span>
      </div>
    ),
  },
  {
    header: "Status",
    cell: ({ row }) => <KycStatusBadge status={row.original.kycStatus} />,
  },
  {
    header: "Submitted",
    cell: ({ row }) => (
      <DateTimeDisplay
        value={row.original.submittedAt}
        className="text-sm text-muted-foreground"
      />
    ),
  },
  {
    header: "",
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <RowActions submission={row.original} />
      </div>
    ),
  },
];

export function KycQueueTable({
  submissions,
  loading,
}: {
  submissions: KycSubmission[];
  loading?: boolean;
}) {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      data={submissions}
      loading={loading}
      getRowId={(s) => s.userId}
      onRowClick={(s) => router.push(`/admin/kyc/${s.userId}`)}
      emptyState={
        <EmptyState
          icon={IdCard}
          title="No submissions found"
          description="The review queue is clear."
          className="border-0 py-12"
        />
      }
    />
  );
}
