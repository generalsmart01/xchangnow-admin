"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { IdCard } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { KycStatusBadge } from "./kyc-status-badge";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { fullName } from "@/lib/format";
import { smartLabel } from "@/lib/labels";
import type { KycSubmission } from "@/lib/types/kyc";

const columns: ColumnDef<KycSubmission>[] = [
  {
    header: "Applicant",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{fullName(row.original.user)}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.user.email}
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
          {row.original.documentNumber}
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
