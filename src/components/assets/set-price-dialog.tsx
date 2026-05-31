"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { setAssetPriceUsd } from "@/lib/api/assets";
import type { Asset, SetAssetPriceUsdBody } from "@/lib/types/asset";

/**
 * Set / override an asset's USD spot price. With "Pin price" on, the CoinGecko
 * poller stops overwriting it (use for stablecoins or manual control).
 */
export function SetPriceDialog({
  asset,
  open,
  onOpenChange,
}: {
  asset: Asset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [priceUsd, setPriceUsd] = useState(asset.priceUsd ?? "");
  const [manualOverride, setManualOverride] = useState(
    asset.priceUsdManualOverride ?? false,
  );

  const mutation = useMutationToast<Asset, SetAssetPriceUsdBody>(
    (body) => setAssetPriceUsd(asset.id, body).then((r) => r.data),
    {
      successMessage: "USD price updated",
      invalidate: [["assets"], ["asset", asset.id]],
      onSuccess: () => onOpenChange(false),
    },
  );

  const valid = priceUsd.trim() !== "" && Number(priceUsd) > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !mutation.isPending && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set USD price — {asset.symbol}</DialogTitle>
          <DialogDescription>
            Override the spot price used to value {asset.symbol} transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price-usd">USD price</Label>
            <Input
              id="price-usd"
              inputMode="decimal"
              value={priceUsd}
              onChange={(e) => setPriceUsd(e.target.value)}
              placeholder="60000.00"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5 pr-4">
              <Label htmlFor="manual-override">Pin price (manual override)</Label>
              <p className="text-xs text-muted-foreground">
                Stops the CoinGecko poller from auto-correcting it. Turn on for
                stablecoins.
              </p>
            </div>
            <Switch
              id="manual-override"
              checked={manualOverride}
              onCheckedChange={setManualOverride}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            disabled={!valid || mutation.isPending}
            onClick={() =>
              mutation.mutate({ priceUsd: priceUsd.trim(), manualOverride })
            }
          >
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Save price
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
