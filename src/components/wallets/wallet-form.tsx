"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AssetNetworkSelect } from "@/components/shared/entity-selects";
import { WalletAddressDisplay } from "./wallet-address-display";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { createWallet, updateWallet } from "@/lib/api/wallets";
import { pairLabel } from "@/lib/asset-display";
import type {
  CreateWalletBody,
  UpdateWalletBody,
  Wallet,
} from "@/lib/types/wallet";

export function WalletForm({ wallet }: { wallet?: Wallet }) {
  const router = useRouter();
  const isEdit = !!wallet;

  const [assetNetworkId, setAssetNetworkId] = useState(wallet?.assetNetworkId ?? "");
  const [address, setAddress] = useState(wallet?.address ?? "");
  const [label, setLabel] = useState(wallet?.label ?? "");
  const [isActive, setIsActive] = useState(wallet?.isActive ?? true);
  const [addressError, setAddressError] = useState<string | null>(null);

  const createMutation = useMutationToast<Wallet, CreateWalletBody>(
    (body) => createWallet(body).then((r) => r.data),
    {
      successMessage: "Wallet created",
      invalidate: [["wallets"]],
      onSuccess: () => router.push("/admin/wallets"),
    },
  );

  const updateMutation = useMutationToast<Wallet, UpdateWalletBody>(
    (body) => updateWallet(wallet!.id, body).then((r) => r.data),
    {
      successMessage: "Wallet updated",
      invalidate: [["wallets"], ["wallet", wallet?.id ?? ""]],
      onSuccess: () => router.push("/admin/wallets"),
    },
  );

  const pending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate({ label: label.trim() || undefined, isActive });
      return;
    }
    if (address.trim().length < 20 || address.trim().length > 120) {
      setAddressError("Address must be 20–120 characters");
      return;
    }
    if (!assetNetworkId) return;
    createMutation.mutate({
      assetNetworkId,
      address: address.trim(),
      label: label.trim() || undefined,
      isActive,
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-5">
      <div className="space-y-2">
        <Label>Asset / network</Label>
        {isEdit ? (
          <Input value={pairLabel(wallet!.assetNetwork)} disabled />
        ) : (
          <AssetNetworkSelect value={assetNetworkId} onChange={setAssetNetworkId} />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        {isEdit ? (
          <div className="rounded-md border bg-muted/40 px-3 py-2">
            <WalletAddressDisplay address={wallet!.address} truncate={false} />
          </div>
        ) : (
          <>
            <Input
              id="address"
              placeholder="bc1qxy…"
              className="font-mono"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setAddressError(null);
              }}
            />
            {addressError ? (
              <p className="text-xs text-destructive">{addressError}</p>
            ) : null}
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          placeholder="Primary BTC hot wallet"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="isActive">Active</Label>
          <p className="text-xs text-muted-foreground">
            Inactive wallets aren&apos;t offered to customers.
          </p>
        </div>
        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending || (!isEdit && !assetNetworkId)}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create wallet"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/wallets")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
