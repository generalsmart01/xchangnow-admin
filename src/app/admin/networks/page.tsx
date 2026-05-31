"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { NetworksTable } from "@/components/networks/networks-table";
import { RoleGate } from "@/components/layout/role-gate";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { listNetworks } from "@/lib/api/networks";

export default function NetworksPage() {
  const q = usePaginatedQuery({
    queryKey: "networks",
    defaultPageSize: 50,
    fetcher: (p) => listNetworks({ page: p.page, pageSize: p.pageSize }),
  });

  const data = q.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Networks"
        description="Blockchain networks available for assets and wallets."
        actions={
          <RoleGate cap="networks.manage">
            <Button asChild>
              <Link href="/admin/networks/new">
                <Plus className="size-4" /> Add network
              </Link>
            </Button>
          </RoleGate>
        }
      />

      <NetworksTable networks={data?.networks ?? []} loading={q.isLoading} />

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
