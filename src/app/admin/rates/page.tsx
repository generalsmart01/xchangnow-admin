"use client";

import { useMemo } from "react";
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
import { LoadingBlock } from "@/components/shared/loading-spinner";
import { CurrentFxCard } from "@/components/rates/current-rates-card";
import { RateHistoryChart } from "@/components/rates/rate-history-chart";
import { RateRowActions } from "@/components/rates/rate-row-actions";
import { ToneBadge } from "@/components/shared/tone-badge";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { RoleGate } from "@/components/layout/role-gate";
import { listRates } from "@/lib/api/rates";
import { money } from "@/lib/format";

export default function RatesPage() {
  const recent = useQuery({
    queryKey: ["rates", { pageSize: 100 }],
    queryFn: () => listRates({ pageSize: 100 }).then((r) => r.data),
  });

  const rates = useMemo(() => recent.data?.rates ?? [], [recent.data]);
  // The list is newest-first, so the head row is the live FX rate.
  const current = rates[0];
  const fiat = current?.fiatCurrency ?? "NGN";

  return (
    <div className="space-y-6">
      <PageHeader
        title="FX rate"
        description="Manual NGN-per-USD rate. The buy/sell spread is the platform fee."
        actions={
          <RoleGate cap="rates.manage">
            <Button asChild>
              <Link href="/admin/rates/new">
                <Plus className="size-4" /> Add FX rate
              </Link>
            </Button>
          </RoleGate>
        }
      />

      <CurrentFxCard rate={current} loading={recent.isLoading} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rate history</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.isLoading ? (
            <LoadingBlock />
          ) : (
            <RateHistoryChart snapshots={rates} fiatCurrency={fiat} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent snapshots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Buy (per USD)</TableHead>
                  <TableHead>Sell (per USD)</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Recorded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No FX rates yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rates.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="tabular-nums text-success">
                        {money(s.buyRate, s.fiatCurrency)}
                      </TableCell>
                      <TableCell className="tabular-nums text-info">
                        {money(s.sellRate, s.fiatCurrency)}
                      </TableCell>
                      <TableCell>
                        <ToneBadge tone={s.isManualOverride ? "warning" : "muted"}>
                          {s.source}
                        </ToneBadge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <DateTimeDisplay value={s.fetchedAt} />
                      </TableCell>
                      <TableCell className="text-right">
                        <RateRowActions rate={s} />
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
