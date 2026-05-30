"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { FilterBar, SelectFilter } from "@/components/shared/filter-bar";
import { WalletsTable } from "@/components/wallets/wallets-table";
import { RoleGate } from "@/components/layout/role-gate";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { listWallets } from "@/lib/api/wallets";
import {
  CRYPTO_ASSETS,
  NETWORKS,
  type CryptoAsset,
  type Network,
} from "@/lib/types/transaction";

export default function WalletsPage() {
  // No pagination on this endpoint, but reuse URL-filter state for asset/network/active.
  const q = usePaginatedQuery({
    queryKey: "wallets",
    filterKeys: ["asset", "network", "isActive"],
    fetcher: (p) =>
      listWallets({
        asset: p.asset as CryptoAsset | "",
        network: p.network as Network | "",
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
          value={q.params.asset as string}
          onChange={(v) => q.setFilter("asset", v)}
          allLabel="All assets"
          placeholder="Asset"
          className="w-[140px]"
          options={CRYPTO_ASSETS.map((a) => ({ value: a, label: a }))}
        />
        <SelectFilter
          value={q.params.network as string}
          onChange={(v) => q.setFilter("network", v)}
          allLabel="All networks"
          placeholder="Network"
          options={NETWORKS.map((n) => ({ value: n, label: n }))}
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
