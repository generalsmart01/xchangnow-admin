"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Power, Trash2, Coins } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToneBadge } from "@/components/shared/tone-badge";
import { AssetIcon } from "@/components/shared/asset-icon";
import { RoleGate } from "@/components/layout/role-gate";
import { useConfirm } from "@/lib/hooks/use-confirm";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { deleteAsset, setAssetEnabled } from "@/lib/api/assets";
import type { Asset } from "@/lib/types/asset";

function RowActions({ asset }: { asset: Asset }) {
  const router = useRouter();
  const confirm = useConfirm();

  const toggle = useMutationToast<Asset, boolean>(
    (enabled) => setAssetEnabled(asset.id, enabled).then((r) => r.data),
    {
      successMessage: (_d, enabled) => (enabled ? "Asset enabled" : "Asset disabled"),
      invalidate: [["assets"]],
    },
  );

  const remove = useMutationToast<null, void>(
    () => deleteAsset(asset.id).then((r) => r.data),
    { successMessage: "Asset deleted", invalidate: [["assets"]] },
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => router.push(`/admin/assets/${asset.id}`)}>
          <Pencil className="size-4" /> Manage
        </DropdownMenuItem>
        <RoleGate cap="assets.manage">
          <DropdownMenuItem
            disabled={toggle.isPending}
            onSelect={(e) => {
              e.preventDefault();
              toggle.mutate(!asset.isEnabled);
            }}
          >
            <Power className="size-4" /> {asset.isEnabled ? "Disable" : "Enable"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={remove.isPending}
            onSelect={async (e) => {
              e.preventDefault();
              const ok = await confirm({
                title: `Delete ${asset.symbol}?`,
                description:
                  "This permanently removes the asset. It will fail if any pairs or transactions reference it — disable it instead.",
                confirmText: "Delete",
                variant: "destructive",
              });
              if (ok) remove.mutate();
            }}
          >
            <Trash2 className="size-4" /> Delete
          </DropdownMenuItem>
        </RoleGate>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns: ColumnDef<Asset>[] = [
  {
    header: "Asset",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <AssetIcon symbol={row.original.symbol} iconUrl={row.original.iconUrl} />
        <div className="flex flex-col">
          <span className="font-medium">{row.original.symbol}</span>
          <span className="text-xs text-muted-foreground">{row.original.name}</span>
        </div>
      </div>
    ),
  },
  {
    header: "Decimals",
    cell: ({ row }) => <span className="tabular-nums">{row.original.decimals}</span>,
  },
  {
    header: "Networks",
    cell: ({ row }) => {
      const n = row.original.networks?.length ?? 0;
      return (
        <span className="text-sm text-muted-foreground">
          {n} network{n === 1 ? "" : "s"}
        </span>
      );
    },
  },
  {
    header: "Sort",
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">{row.original.sortOrder}</span>
    ),
  },
  {
    header: "Status",
    cell: ({ row }) =>
      row.original.isEnabled ? (
        <ToneBadge tone="success" dot>
          Enabled
        </ToneBadge>
      ) : (
        <ToneBadge tone="muted" dot>
          Disabled
        </ToneBadge>
      ),
  },
  {
    header: "",
    id: "actions",
    cell: ({ row }) => <RowActions asset={row.original} />,
  },
];

export function AssetsTable({
  assets,
  loading,
}: {
  assets: Asset[];
  loading?: boolean;
}) {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      data={assets}
      loading={loading}
      getRowId={(a) => a.id}
      onRowClick={(a) => router.push(`/admin/assets/${a.id}`)}
      emptyState={
        <EmptyState
          icon={Coins}
          title="No assets yet"
          description="Add a crypto asset to start configuring networks and rates."
          className="border-0 py-12"
        />
      }
    />
  );
}
