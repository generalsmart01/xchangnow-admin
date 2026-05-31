"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { UserStatusBadge } from "./user-status-badge";
import { RoleBadge } from "@/components/staff/role-badge";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { fullName, truncateMiddle } from "@/lib/format";
import type { AdminUser } from "@/lib/types/user";

const columns: ColumnDef<AdminUser>[] = [
  {
    header: "User",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{fullName(row.original)}</span>
        <span className="text-xs text-muted-foreground">{row.original.email}</span>
      </div>
    ),
  },
  {
    header: "Phone",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.phoneNumber ?? "—"}
      </span>
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
    header: "Joined",
    cell: ({ row }) => (
      <DateTimeDisplay
        value={row.original.createdAt}
        absolute
        className="text-sm text-muted-foreground"
      />
    ),
  },
  {
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {truncateMiddle(row.original.id)}
      </span>
    ),
  },
];

export function UsersTable({
  users,
  loading,
}: {
  users: AdminUser[];
  loading?: boolean;
}) {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      data={users}
      loading={loading}
      getRowId={(u) => u.id}
      onRowClick={(u) => router.push(`/admin/users/${u.id}`)}
      emptyState={
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try adjusting your filters."
          className="border-0 py-12"
        />
      }
    />
  );
}
