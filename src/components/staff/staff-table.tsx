"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCog } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { RoleBadge } from "./role-badge";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { fullName } from "@/lib/format";
import type { StaffMember } from "@/lib/types/staff";

const columns: ColumnDef<StaffMember>[] = [
  {
    header: "Staff",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{fullName(row.original)}</span>
        <span className="text-xs text-muted-foreground">{row.original.email}</span>
      </div>
    ),
  },
  {
    header: "Role",
    cell: ({ row }) => <RoleBadge role={row.original.role} />,
  },
  {
    header: "Status",
    cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
  },
  {
    header: "Last login",
    cell: ({ row }) => (
      <DateTimeDisplay
        value={row.original.lastLoginAt}
        className="text-sm text-muted-foreground"
      />
    ),
  },
];

export function StaffTable({
  staff,
  loading,
}: {
  staff: StaffMember[];
  loading?: boolean;
}) {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      data={staff}
      loading={loading}
      getRowId={(s) => s.id}
      onRowClick={(s) => router.push(`/admin/staff/${s.id}`)}
      emptyState={
        <EmptyState
          icon={UserCog}
          title="No staff found"
          description="Invite a teammate to get started."
          className="border-0 py-12"
        />
      }
    />
  );
}
