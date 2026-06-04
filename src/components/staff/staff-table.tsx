"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, UserCog } from "lucide-react";

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
import { RoleBadge } from "./role-badge";
import { ChangeRoleDialog } from "./change-role-dialog";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { useAuth } from "@/lib/hooks/use-auth";
import { fullName } from "@/lib/format";
import type { StaffMember } from "@/lib/types/staff";

function RowActions({ staff }: { staff: StaffMember }) {
  const router = useRouter();
  const { user: me } = useAuth();
  const [roleOpen, setRoleOpen] = useState(false);

  const isSelf = staff.id === me.id;
  const isSuperAdmin = staff.role === "SUPER_ADMIN";

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
            onSelect={() => router.push(`/admin/staff/${staff.id}`)}
          >
            <Eye className="size-4" /> View details
          </DropdownMenuItem>
          <RoleGate cap="staff.changeRole">
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isSelf || isSuperAdmin}
              onSelect={() => setRoleOpen(true)}
            >
              <UserCog className="size-4" /> Change role
            </DropdownMenuItem>
          </RoleGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangeRoleDialog
        staff={staff}
        open={roleOpen}
        onOpenChange={setRoleOpen}
      />
    </>
  );
}

const columns: ColumnDef<StaffMember>[] = [
  {
    header: "Staff",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{fullName(row.original)}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.email}
        </span>
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
  {
    header: "",
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <RowActions staff={row.original} />
      </div>
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
      onRowClick={(s) => router.push(`/users/${s.id}`)}
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
