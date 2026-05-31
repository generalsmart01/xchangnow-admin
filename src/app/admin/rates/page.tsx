"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SelectFilter } from "@/components/shared/filter-bar";
import { LoadingBlock } from "@/components/shared/loading-spinner";
import { CurrentRatesCard } from "@/components/rates/current-rates-card";
import { RateHistoryChart } from "@/components/rates/rate-history-chart";
import { ToneBadge } from "@/components/shared/tone-badge";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { RoleGate } from "@/components/layout/role-gate";
import { useAssetsCatalogue } from "@/components/shared/entity-selects";
import { listRates } from "@/lib/api/rates";
import type { RateSnapshot } from "@/lib/types/rate";
import { money } from "@/lib/format";

/** Newest snapshot per asset, from a flat newest-first list. */
function deriveCurrent(rates: RateSnapshot[]): RateSnapshot[] {
  const seen = new Set<string>();
  const out: RateSnapshot[] = [];
  for (const r of rates) {
    if (seen.has(r.assetId)) continue;
    seen.add(r.assetId);
    out.push(r);
  }
  return out;
}

export default function RatesPage() {
  const { data: assets = [] } = useAssetsCatalogue();
  const [assetId, setAssetId] = useState<string>("");

  // Default the history selector to the first asset once the catalogue loads.
  const selectedAssetId = assetId || assets[0]?.id || "";

  const recent = useQuery({
    queryKey: ["rates", { pageSize: 100 }],
    queryFn: () => listRates({ pageSize: 100 }).then((r) => r.data),
  });

  const history = useQuery({
    queryKey: ["rates", { assetId: selectedAssetId, pageSize: 50 }],
    queryFn: () =>
      listRates({ assetId: selectedAssetId, pageSize: 50 }).then((r) => r.data),
    enabled: !!selectedAssetId,
  });

  const current = useMemo(
    () => deriveCurrent(recent.data?.rates ?? []),
    [recent.data],
  );
  const fiat = current[0]?.fiatCurrency ?? "NGN";
  const snapshots = history.data?.rates ?? [];
  const selectedSymbol =
    assets.find((a) => a.id === selectedAssetId)?.symbol ?? "asset";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rates"
        description="Latest buy/sell rates and snapshot history per asset."
        actions={
          <RoleGate cap="rates.manage">
            <Button asChild>
              <Link href="/admin/rates/new">
                <Plus className="size-4" /> Add snapshot
              </Link>
            </Button>
          </RoleGate>
        }
      />

      <CurrentRatesCard rates={current} fiatCurrency={fiat} loading={recent.isLoading} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Rate history</CardTitle>
          <SelectFilter
            value={selectedAssetId}
            onChange={(v) => setAssetId(v)}
            allLabel="Select asset"
            placeholder="Asset"
            className="w-[150px]"
            options={assets.map((a) => ({ value: a.id, label: a.symbol }))}
          />
        </CardHeader>
        <CardContent>
          {history.isLoading ? (
            <LoadingBlock />
          ) : (
            <RateHistoryChart snapshots={snapshots} fiatCurrency={fiat} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Recent snapshots — {selectedSymbol}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Buy</TableHead>
                  <TableHead>Sell</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Recorded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshots.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      No snapshots yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  snapshots.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="tabular-nums text-success">
                        {money(s.buyRate, fiat)}
                      </TableCell>
                      <TableCell className="tabular-nums text-info">
                        {money(s.sellRate, fiat)}
                      </TableCell>
                      <TableCell>
                        <ToneBadge tone={s.isManualOverride ? "warning" : "muted"}>
                          {s.source}
                        </ToneBadge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <DateTimeDisplay value={s.fetchedAt} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
