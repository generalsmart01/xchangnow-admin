"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { FilterBar, SelectFilter } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { StaffTable } from "@/components/staff/staff-table";
import { RoleGate } from "@/components/layout/role-gate";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { listStaff } from "@/lib/api/staff";
import { ASSIGNABLE_STAFF_ROLES } from "@/lib/types/staff";
import { USER_STATUSES, type Role, type UserStatus } from "@/lib/types/user";
import { titleCase } from "@/lib/labels";

export default function StaffPage() {
  const q = usePaginatedQuery({
    queryKey: "staff",
    filterKeys: ["role", "status"],
    fetcher: (p) =>
      listStaff({
        page: p.page,
        pageSize: p.pageSize,
        role: p.role as Role | "",
        status: p.status as UserStatus | "",
      }),
  });

  const data = q.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Staff"
        description="Team members with console access."
        actions={
          <RoleGate roles={["SUPER_ADMIN"]}>
            <Button asChild>
              <Link href="/admin/staff/invite">
                <UserPlus className="size-4" /> Invite staff
              </Link>
            </Button>
          </RoleGate>
        }
      />

      <FilterBar>
        <SelectFilter
          value={q.params.role as string}
          onChange={(v) => q.setFilter("role", v)}
          allLabel="All roles"
          placeholder="Role"
          options={[...ASSIGNABLE_STAFF_ROLES, "SUPER_ADMIN" as Role].map((r) => ({
            value: r,
            label: titleCase(r),
          }))}
        />
        <SelectFilter
          value={q.params.status as string}
          onChange={(v) => q.setFilter("status", v)}
          allLabel="All statuses"
          placeholder="Status"
          options={USER_STATUSES.map((s) => ({ value: s, label: titleCase(s) }))}
        />
      </FilterBar>

      <StaffTable staff={data?.staff ?? []} loading={q.isLoading} />

      {data ? (
        <Pagination
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={q.setPage}
          disabled={q.isFetching}
        />
      ) : null}
    </div>
  );
}
