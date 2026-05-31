"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Eye, MoreHorizontal, ShieldAlert, Users } from "lucide-react";

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
import { UserStatusBadge } from "./user-status-badge";
import { ChangeStatusDialog } from "./change-status-dialog";
import { AnonymizeDialog } from "./anonymize-dialog";
import { RoleBadge } from "@/components/staff/role-badge";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { fullName, truncateMiddle } from "@/lib/format";
import type { AdminUser } from "@/lib/types/user";

function RowActions({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"status" | "anon" | null>(null);
  const isAnonymized = user.status === "ANONYMIZED";

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
          <DropdownMenuItem onSelect={() => router.push(`/admin/users/${user.id}`)}>
            <Eye className="size-4" /> View details
          </DropdownMenuItem>
          <RoleGate cap="users.changeStatus">
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isAnonymized}
              onSelect={() => setDialog("status")}
            >
              <Ban className="size-4" /> Change status
            </DropdownMenuItem>
          </RoleGate>
          <RoleGate cap="users.anonymize">
            <DropdownMenuItem
              variant="destructive"
              disabled={isAnonymized}
              onSelect={() => setDialog("anon")}
            >
              <ShieldAlert className="size-4" /> Anonymize
            </DropdownMenuItem>
          </RoleGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangeStatusDialog
        user={user}
        open={dialog === "status"}
        onOpenChange={(o) => setDialog(o ? "status" : null)}
      />
      <AnonymizeDialog
        user={user}
        open={dialog === "anon"}
        onOpenChange={(o) => setDialog(o ? "anon" : null)}
      />
    </>
  );
}

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
  {
    header: "",
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <RowActions user={row.original} />
      </div>
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
