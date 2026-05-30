"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, IdCard, Minus } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { KycStatusBadge } from "./kyc-status-badge";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { fullName } from "@/lib/format";
import type { KycQueueItem } from "@/lib/types/kyc";

function YesNo({ value }: { value: boolean }) {
  return value ? (
    <Check className="size-4 text-success" />
  ) : (
    <Minus className="size-4 text-muted-foreground" />
  );
}

const columns: ColumnDef<KycQueueItem>[] = [
  {
    header: "Applicant",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{fullName(row.original)}</span>
        <span className="text-xs text-muted-foreground">{row.original.email}</span>
      </div>
    ),
  },
  {
    header: "Status",
    cell: ({ row }) => <KycStatusBadge status={row.original.status} />,
  },
  {
    header: "BVN",
    cell: ({ row }) => <YesNo value={row.original.hasBvn} />,
  },
  {
    header: "NIN",
    cell: ({ row }) => <YesNo value={row.original.hasNin} />,
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
  submissions: KycQueueItem[];
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
