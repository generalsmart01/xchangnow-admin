"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { AssetsTable } from "@/components/assets/assets-table";
import { RoleGate } from "@/components/layout/role-gate";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { listAssets } from "@/lib/api/assets";

export default function AssetsPage() {
  const q = usePaginatedQuery({
    queryKey: "assets",
    defaultPageSize: 50,
    fetcher: (p) => listAssets({ page: p.page, pageSize: p.pageSize }),
  });

  const data = q.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Assets"
        description="Crypto assets and the networks they trade on."
        actions={
          <RoleGate cap="assets.manage">
            <Button asChild>
              <Link href="/admin/assets/new">
                <Plus className="size-4" /> Add asset
              </Link>
            </Button>
          </RoleGate>
        }
      />

      <AssetsTable assets={data?.assets ?? []} loading={q.isLoading} />

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
