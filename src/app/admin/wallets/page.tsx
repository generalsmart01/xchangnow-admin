"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { FilterBar, SelectFilter } from "@/components/shared/filter-bar";
import { WalletsTable } from "@/components/wallets/wallets-table";
import { RoleGate } from "@/components/layout/role-gate";
import {
  useAssetsCatalogue,
  useNetworksCatalogue,
} from "@/components/shared/entity-selects";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { listWallets } from "@/lib/api/wallets";

export default function WalletsPage() {
  const { data: assets = [] } = useAssetsCatalogue();
  const { data: networks = [] } = useNetworksCatalogue();

  // No pagination on this endpoint, but reuse URL-filter state for asset/network/active.
  const q = usePaginatedQuery({
    queryKey: "wallets",
    filterKeys: ["assetId", "networkId", "isActive"],
    fetcher: (p) =>
      listWallets({
        assetId: (p.assetId as string) || undefined,
        networkId: (p.networkId as string) || undefined,
        isActive: p.isActive === "" ? "" : p.isActive === "true",
      }),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Wallets"
        description="Hot wallet addresses customers deposit to."
        actions={
          <RoleGate cap="wallets.manage">
            <Button asChild>
              <Link href="/admin/wallets/new">
                <Plus className="size-4" /> Add wallet
              </Link>
            </Button>
          </RoleGate>
        }
      />

      <FilterBar>
        <SelectFilter
          value={q.params.assetId as string}
          onChange={(v) => q.setFilter("assetId", v)}
          allLabel="All assets"
          placeholder="Asset"
          className="w-[150px]"
          options={assets.map((a) => ({ value: a.id, label: a.symbol }))}
        />
        <SelectFilter
          value={q.params.networkId as string}
          onChange={(v) => q.setFilter("networkId", v)}
          allLabel="All networks"
          placeholder="Network"
          options={networks.map((n) => ({ value: n.id, label: n.name }))}
        />
        <SelectFilter
          value={q.params.isActive as string}
          onChange={(v) => q.setFilter("isActive", v)}
          allLabel="All"
          placeholder="Active"
          className="w-[130px]"
          options={[
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" },
          ]}
        />
      </FilterBar>

      <WalletsTable wallets={q.data ?? []} loading={q.isLoading} />
    </div>
  );
}
