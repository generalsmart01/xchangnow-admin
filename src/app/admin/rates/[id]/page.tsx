"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingBlock } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { DetailList, DetailRow } from "@/components/shared/detail-list";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { ToneBadge } from "@/components/shared/tone-badge";
import { RoleGate } from "@/components/layout/role-gate";
import { EditRateForm } from "@/components/rates/edit-rate-form";
import { getRate } from "@/lib/api/rates";
import { ApiError } from "@/lib/api/client";
import { money } from "@/lib/format";

export default function RateDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: rate, isLoading, error } = useQuery({
    queryKey: ["rate", id],
    queryFn: () => getRate(id).then((r) => r.data),
  });

  const spread =
    rate != null
      ? money(
          (Number(rate.buyRate) - Number(rate.sellRate)).toString(),
          rate.fiatCurrency,
        )
      : "—";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/admin/rates">
          <ArrowLeft className="size-4" /> Back to rates
        </Link>
      </Button>

      {isLoading ? (
        <LoadingBlock label="Loading FX rate…" />
      ) : error || !rate ? (
        <EmptyState
          icon={XCircle}
          title={
            error instanceof ApiError && error.status === 404
              ? "Rate not found"
              : "Couldn't load rate"
          }
          description={error instanceof ApiError ? error.message : "Please try again."}
          action={
            <Button variant="outline" asChild>
              <Link href="/admin/rates">
                <ArrowLeft className="size-4" /> Back to rates
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <PageHeader
            title={`FX rate — ${rate.fiatCurrency} per USD`}
            description={
              <span className="flex items-center gap-1.5">
                Recorded <DateTimeDisplay value={rate.fetchedAt} />
              </span>
            }
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailList>
                <DetailRow label="Fiat currency">{rate.fiatCurrency}</DetailRow>
                <DetailRow label="Buy rate (per USD)">
                  <span className="tabular-nums text-success">
                    {money(rate.buyRate, rate.fiatCurrency)}
                  </span>
                </DetailRow>
                <DetailRow label="Sell rate (per USD)">
                  <span className="tabular-nums text-info">
                    {money(rate.sellRate, rate.fiatCurrency)}
                  </span>
                </DetailRow>
                <DetailRow label="Spread">
                  <span className="tabular-nums">{spread}</span>
                </DetailRow>
                <DetailRow label="Source">
                  <ToneBadge tone={rate.isManualOverride ? "warning" : "muted"}>
                    {rate.source}
                  </ToneBadge>
                </DetailRow>
                <DetailRow label="Manual override">
                  {rate.isManualOverride ? "Yes" : "No"}
                </DetailRow>
                <DetailRow label="Recorded">
                  <DateTimeDisplay value={rate.fetchedAt} />
                </DetailRow>
              </DetailList>
            </CardContent>
          </Card>

          {/* Edit + delete are SUPER_ADMIN / ADMIN only. */}
          <RoleGate cap="rates.manage">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Edit rate</CardTitle>
              </CardHeader>
              <CardContent>
                <EditRateForm rate={rate} />
              </CardContent>
            </Card>
          </RoleGate>
        </>
      )}
    </div>
  );
}
