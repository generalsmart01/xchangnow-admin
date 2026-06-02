"use client";

import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar, SelectFilter } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KycQueueTable } from "@/components/kyc/kyc-queue-table";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { listKyc } from "@/lib/api/kyc";
import { KYC_STATUSES, type KycStatus } from "@/lib/types/kyc";
import { titleCase } from "@/lib/labels";

export default function KycPage() {
  const q = usePaginatedQuery({
    queryKey: "kyc",
    filterKeys: ["status"],
    fetcher: (p) =>
      listKyc({
        page: p.page,
        pageSize: p.pageSize,
        status: p.status as KycStatus | "",
      }),
  });

  const data = q.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="KYC review"
        description="Verify customer identity submissions. Oldest first."
      />

      <Alert>
        <AlertTriangle className="size-4" />
        <AlertDescription>
          Opening a submission decrypts and displays sensitive PII (BVN/NIN).
          Every view is logged to the audit trail.
        </AlertDescription>
      </Alert>

      <FilterBar>
        <SelectFilter
          value={q.params.status as string}
          onChange={(v) => q.setFilter("status", v)}
          allLabel="All statuses"
          placeholder="Status"
          options={KYC_STATUSES.map((s) => ({ value: s, label: titleCase(s) }))}
        />
      </FilterBar>

      <KycQueueTable
        submissions={data?.submissions ?? []}
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
