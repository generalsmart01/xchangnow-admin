"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { NetworkSelect } from "@/components/shared/entity-selects";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { attachAssetNetwork, updateAssetNetwork } from "@/lib/api/assets";
import type {
  AssetNetworkPair,
  CreateAssetNetworkBody,
  UpdateAssetNetworkBody,
} from "@/lib/types/asset-network";

type Props = {
  assetId: string;
  /** Provide to edit an existing pair; omit to attach a new one. */
  pair?: AssetNetworkPair;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function optStr(v: string): string | null {
  return v.trim() ? v.trim() : null;
}
function optNum(v: string): number | null {
  if (!v.trim()) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export function PairDialog({ assetId, pair, open, onOpenChange }: Props) {
  const isEdit = !!pair;
  const [networkId, setNetworkId] = useState(pair?.networkId ?? "");
  const [contractAddress, setContractAddress] = useState(pair?.contractAddress ?? "");
  const [decimals, setDecimals] = useState(
    pair?.decimals != null ? String(pair.decimals) : "",
  );
  const [minDeposit, setMinDeposit] = useState(pair?.minDeposit ?? "");
  const [minWithdrawal, setMinWithdrawal] = useState(pair?.minWithdrawal ?? "");
  const [withdrawalFee, setWithdrawalFee] = useState(pair?.withdrawalFee ?? "");
  const [confirmations, setConfirmations] = useState(
    pair?.confirmationsRequired != null ? String(pair.confirmationsRequired) : "",
  );
  const [isEnabled, setIsEnabled] = useState(pair?.isEnabled ?? true);

  const invalidate: unknown[][] = [["asset", assetId], ["assets"]];

  const attach = useMutationToast<AssetNetworkPair, CreateAssetNetworkBody>(
    (body) => attachAssetNetwork(assetId, body).then((r) => r.data),
    {
      successMessage: "Network attached",
      invalidate,
      onSuccess: () => onOpenChange(false),
    },
  );

  const update = useMutationToast<AssetNetworkPair, UpdateAssetNetworkBody>(
    (body) => updateAssetNetwork(pair!.id, body).then((r) => r.data),
    {
      successMessage: "Pair updated",
      invalidate,
      onSuccess: () => onOpenChange(false),
    },
  );

  const pending = attach.isPending || update.isPending;

  function submit() {
    const shared = {
      contractAddress: optStr(contractAddress),
      decimals: optNum(decimals),
      minDeposit: optStr(minDeposit),
      minWithdrawal: optStr(minWithdrawal),
      withdrawalFee: optStr(withdrawalFee),
      confirmationsRequired: optNum(confirmations),
      isEnabled,
    };
    if (isEdit) {
      update.mutate(shared);
    } else {
      attach.mutate({ networkId, ...shared });
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit network pair" : "Attach network"}
      confirmText={isEdit ? "Save pair" : "Attach"}
      loading={pending}
      disabled={!isEdit && !networkId}
      onConfirm={submit}
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Network</Label>
          {isEdit ? (
            <Input
              value={pair?.network?.name ?? pair?.networkId ?? ""}
              disabled
            />
          ) : (
            <NetworkSelect value={networkId} onChange={setNetworkId} />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contract">Contract address</Label>
          <Input
            id="contract"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="0x… (leave blank for native asset)"
            className="font-mono text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="decimals-override">Decimals override</Label>
            <Input
              id="decimals-override"
              inputMode="numeric"
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              placeholder="inherit"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmations">Confirmations</Label>
            <Input
              id="confirmations"
              inputMode="numeric"
              value={confirmations}
              onChange={(e) => setConfirmations(e.target.value)}
              placeholder="12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-deposit">Min deposit</Label>
            <Input
              id="min-deposit"
              inputMode="decimal"
              value={minDeposit}
              onChange={(e) => setMinDeposit(e.target.value)}
              placeholder="1.0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-withdrawal">Min withdrawal</Label>
            <Input
              id="min-withdrawal"
              inputMode="decimal"
              value={minWithdrawal}
              onChange={(e) => setMinWithdrawal(e.target.value)}
              placeholder="1.0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="withdrawal-fee">Withdrawal fee</Label>
            <Input
              id="withdrawal-fee"
              inputMode="decimal"
              value={withdrawalFee}
              onChange={(e) => setWithdrawalFee(e.target.value)}
              placeholder="0.5"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <Label htmlFor="pair-enabled">Enabled</Label>
          <Switch
            id="pair-enabled"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>
      </div>
    </ConfirmDialog>
  );
}
