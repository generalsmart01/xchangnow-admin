"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Link2 } from "lucide-react";

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
import { ToneBadge } from "@/components/shared/tone-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CopyButton } from "@/components/shared/copy-button";
import { RoleGate } from "@/components/layout/role-gate";
import { PairDialog } from "./pair-dialog";
import { useConfirm } from "@/lib/hooks/use-confirm";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { deleteAssetNetwork } from "@/lib/api/assets";
import { truncateMiddle } from "@/lib/format";
import type { Asset } from "@/lib/types/asset";
import type { AssetNetworkPair } from "@/lib/types/asset-network";

function PairRow({ assetId, pair }: { assetId: string; pair: AssetNetworkPair }) {
  const confirm = useConfirm();
  const [editing, setEditing] = useState(false);

  const remove = useMutationToast<null, void>(
    () => deleteAssetNetwork(pair.id).then((r) => r.data),
    { successMessage: "Pair removed", invalidate: [["asset", assetId], ["assets"]] },
  );

  return (
    <TableRow>
      <TableCell className="font-medium">
        {pair.network?.name ?? pair.network?.code ?? truncateMiddle(pair.networkId)}
      </TableCell>
      <TableCell>
        {pair.contractAddress ? (
          <span className="inline-flex items-center gap-1">
            <code className="font-mono text-xs">
              {truncateMiddle(pair.contractAddress, 8, 6)}
            </code>
            <CopyButton value={pair.contractAddress} label="Contract" />
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Native</span>
        )}
      </TableCell>
      <TableCell className="tabular-nums">{pair.minWithdrawal ?? "—"}</TableCell>
      <TableCell className="tabular-nums">{pair.withdrawalFee ?? "—"}</TableCell>
      <TableCell className="tabular-nums">{pair.confirmationsRequired ?? "—"}</TableCell>
      <TableCell>
        {pair.isEnabled ? (
          <ToneBadge tone="success" dot>
            Enabled
          </ToneBadge>
        ) : (
          <ToneBadge tone="muted" dot>
            Disabled
          </ToneBadge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <RoleGate cap="assets.manage">
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setEditing(true)}
              aria-label="Edit pair"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive"
              disabled={remove.isPending}
              onClick={async () => {
                const ok = await confirm({
                  title: "Remove network pair?",
                  description:
                    "This detaches the network from the asset. It will fail if transactions or wallets reference it.",
                  confirmText: "Remove",
                  variant: "destructive",
                });
                if (ok) remove.mutate();
              }}
              aria-label="Remove pair"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </RoleGate>
        {editing ? (
          <PairDialog
            assetId={assetId}
            pair={pair}
            open={editing}
            onOpenChange={setEditing}
          />
        ) : null}
      </TableCell>
    </TableRow>
  );
}

export function AssetNetworksPanel({ asset }: { asset: Asset }) {
  const [attaching, setAttaching] = useState(false);
  const pairs = asset.networks ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Networks</CardTitle>
        <RoleGate cap="assets.manage">
          <Button size="sm" onClick={() => setAttaching(true)}>
            <Plus className="size-4" /> Attach network
          </Button>
        </RoleGate>
      </CardHeader>
      <CardContent>
        {pairs.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="No networks attached"
            description="Attach a network to define its contract address, fees and confirmations."
            className="py-10"
          />
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Network</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Min withdrawal</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Confirmations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pairs.map((pair) => (
                  <PairRow key={pair.id} assetId={asset.id} pair={pair} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {attaching ? (
        <PairDialog
          assetId={asset.id}
          open={attaching}
          onOpenChange={setAttaching}
        />
      ) : null}
    </Card>
  );
}
