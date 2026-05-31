"use client";

import { PageHeader } from "@/components/shared/page-header";
import { FilterBar, SelectFilter } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { useAssetsCatalogue } from "@/components/shared/entity-selects";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { listTransactions } from "@/lib/api/transactions";
import {
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
  type TransactionStatus,
  type TransactionType,
} from "@/lib/types/transaction";
import { titleCase } from "@/lib/labels";

export default function TransactionsPage() {
  const { data: assets = [] } = useAssetsCatalogue();

  const q = usePaginatedQuery({
    queryKey: "transactions",
    filterKeys: ["status", "type", "assetId"],
    defaults: { status: "UNDER_REVIEW" },
    fetcher: (p) =>
      listTransactions({
        page: p.page,
        pageSize: p.pageSize,
        status: p.status as TransactionStatus | "",
        type: p.type as TransactionType | "",
        assetId: p.assetId as string,
      }),
  });

  const data = q.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transactions"
        description="Review, approve and complete customer transactions."
      />

      <FilterBar>
        <SelectFilter
          value={q.params.status as string}
          onChange={(v) => q.setFilter("status", v)}
          allLabel="All statuses"
          placeholder="Status"
          options={TRANSACTION_STATUSES.map((s) => ({
            value: s,
            label: titleCase(s),
          }))}
        />
        <SelectFilter
          value={q.params.type as string}
          onChange={(v) => q.setFilter("type", v)}
          allLabel="All types"
          placeholder="Type"
          className="w-[150px]"
          options={TRANSACTION_TYPES.map((t) => ({ value: t, label: titleCase(t) }))}
        />
        <SelectFilter
          value={q.params.assetId as string}
          onChange={(v) => q.setFilter("assetId", v)}
          allLabel="All assets"
          placeholder="Asset"
          className="w-[160px]"
          options={assets.map((a) => ({ value: a.id, label: a.symbol }))}
        />
      </FilterBar>

      <TransactionsTable
        transactions={data?.transactions ?? []}
        loading={q.isLoading}
      />

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
