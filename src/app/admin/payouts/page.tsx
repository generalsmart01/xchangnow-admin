"use client";

import { PageHeader } from "@/components/shared/page-header";
import { FilterBar, SelectFilter } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { PayoutsTable } from "@/components/payouts/payouts-table";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { listPayouts } from "@/lib/api/payouts";
import { PAYOUT_STATUSES, type PayoutStatus } from "@/lib/types/payout";
import { titleCase } from "@/lib/labels";

export default function PayoutsPage() {
  const q = usePaginatedQuery({
    queryKey: "payouts",
    filterKeys: ["status"],
    defaults: { status: "PENDING" },
    fetcher: (p) =>
      listPayouts({
        page: p.page,
        pageSize: p.pageSize,
        status: p.status as PayoutStatus | "",
      }),
  });

  const data = q.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payouts"
        description="Process NGN bank payouts for approved SELL transactions."
      />

      <FilterBar>
        <SelectFilter
          value={q.params.status as string}
          onChange={(v) => q.setFilter("status", v)}
          allLabel="All statuses"
          placeholder="Status"
          options={PAYOUT_STATUSES.map((s) => ({ value: s, label: titleCase(s) }))}
        />
      </FilterBar>

      <PayoutsTable payouts={data?.payouts ?? []} loading={q.isLoading} />

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
