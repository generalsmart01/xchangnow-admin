"use client";

import { PageHeader } from "@/components/shared/page-header";
import { FilterBar, SearchInput, SelectFilter } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { UsersTable } from "@/components/users/users-table";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { listUsers } from "@/lib/api/users";
import { USER_STATUSES, type UserStatus } from "@/lib/types/user";
import { titleCase } from "@/lib/labels";

export default function UsersPage() {
  const q = usePaginatedQuery({
    queryKey: "users",
    filterKeys: ["status", "search"],
    fetcher: (p) =>
      listUsers({
        page: p.page,
        pageSize: p.pageSize,
        status: p.status as UserStatus | "",
        search: p.search as string,
      }),
  });

  const data = q.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description="Customer accounts. Opening a profile is logged for audit."
      />

      <FilterBar>
        <SearchInput
          value={q.params.search as string}
          onChange={(v) => q.setFilter("search", v)}
          placeholder="Search by name or email…"
        />
        <SelectFilter
          value={q.params.status as string}
          onChange={(v) => q.setFilter("status", v)}
          allLabel="All statuses"
          placeholder="Status"
          options={USER_STATUSES.map((s) => ({ value: s, label: titleCase(s) }))}
        />
      </FilterBar>

      <UsersTable users={data?.users ?? []} loading={q.isLoading} />

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
