"use client";

import { useState } from "react";
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
import { getCurrentRates, listRates } from "@/lib/api/rates";
import { CRYPTO_ASSETS, type CryptoAsset } from "@/lib/types/transaction";
import { money } from "@/lib/format";

export default function RatesPage() {
  const [asset, setAsset] = useState<CryptoAsset>("BTC");

  const current = useQuery({
    queryKey: ["rates", "current"],
    queryFn: () => getCurrentRates().then((r) => r.data),
  });

  const history = useQuery({
    queryKey: ["rates", { asset, pageSize: 50 }],
    queryFn: () => listRates({ asset, pageSize: 50 }).then((r) => r.data),
  });

  const fiat = current.data?.fiatCurrency ?? "NGN";
  const snapshots = history.data?.rates ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rates"
        description="Live buy/sell rates and snapshot history per asset."
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

      <CurrentRatesCard
        rates={current.data?.rates ?? []}
        fiatCurrency={fiat}
        loading={current.isLoading}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Rate history</CardTitle>
          <SelectFilter
            value={asset}
            onChange={(v) => setAsset((v || "BTC") as CryptoAsset)}
            allLabel="BTC"
            placeholder="Asset"
            className="w-[120px]"
            options={CRYPTO_ASSETS.map((a) => ({ value: a, label: a }))}
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
          <CardTitle className="text-base">Recent snapshots — {asset}</CardTitle>
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
