"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DetailList, DetailRow } from "@/components/shared/detail-list";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { ToneBadge } from "@/components/shared/tone-badge";
import { RoleGate } from "@/components/layout/role-gate";
import { SetPriceDialog } from "./set-price-dialog";
import { money } from "@/lib/format";
import type { Asset } from "@/lib/types/asset";

/** USD spot price card with a "Set USD price" action (assets.manage). */
export function AssetPriceCard({ asset }: { asset: Asset }) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">USD price</CardTitle>
        <RoleGate cap="assets.manage">
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <DollarSign className="size-4" /> Set USD price
          </Button>
        </RoleGate>
      </CardHeader>
      <CardContent>
        <DetailList>
          <DetailRow label="Spot price">
            <span className="tabular-nums">
              {asset.priceUsd != null ? money(asset.priceUsd, "USD") : "—"}
            </span>
          </DetailRow>
          <DetailRow label="Source">
            {asset.priceUsdSource ? (
              <ToneBadge tone="muted">{asset.priceUsdSource}</ToneBadge>
            ) : (
              "—"
            )}
          </DetailRow>
          <DetailRow label="Pinned (manual override)">
            {asset.priceUsdManualOverride ? (
              <ToneBadge tone="warning">Pinned</ToneBadge>
            ) : (
              "Auto (CoinGecko)"
            )}
          </DetailRow>
          <DetailRow label="Price updated">
            <DateTimeDisplay value={asset.priceUsdUpdatedAt} />
          </DetailRow>
          <DetailRow label="CoinGecko ID">
            <span className="font-mono text-xs">{asset.coinGeckoId ?? "—"}</span>
          </DetailRow>
        </DetailList>
      </CardContent>

      <SetPriceDialog asset={asset} open={open} onOpenChange={setOpen} />
    </Card>
  );
}
