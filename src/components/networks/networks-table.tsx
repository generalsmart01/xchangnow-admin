"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Power, Trash2, Network as NetworkIcon } from "lucide-react";

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
import { RoleGate } from "@/components/layout/role-gate";
import { useConfirm } from "@/lib/hooks/use-confirm";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { deleteNetwork, setNetworkEnabled } from "@/lib/api/networks";
import type { NetworkEntity } from "@/lib/types/network";

function RowActions({ network }: { network: NetworkEntity }) {
  const router = useRouter();
  const confirm = useConfirm();

  const toggle = useMutationToast<NetworkEntity, boolean>(
    (enabled) => setNetworkEnabled(network.id, enabled).then((r) => r.data),
    {
      successMessage: (_d, enabled) => (enabled ? "Network enabled" : "Network disabled"),
      invalidate: [["networks"]],
    },
  );

  const remove = useMutationToast<null, void>(
    () => deleteNetwork(network.id).then((r) => r.data),
    { successMessage: "Network deleted", invalidate: [["networks"]] },
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => router.push(`/admin/networks/${network.id}`)}>
          <Pencil className="size-4" /> Edit
        </DropdownMenuItem>
        <RoleGate cap="networks.manage">
          <DropdownMenuItem
            disabled={toggle.isPending}
            onSelect={(e) => {
              e.preventDefault();
              toggle.mutate(!network.isEnabled);
            }}
          >
            <Power className="size-4" /> {network.isEnabled ? "Disable" : "Enable"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={remove.isPending}
            onSelect={async (e) => {
              e.preventDefault();
              const ok = await confirm({
                title: `Delete ${network.name}?`,
                description:
                  "This permanently removes the network. It will fail if any asset-network pairs still reference it — disable it instead.",
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

const columns: ColumnDef<NetworkEntity>[] = [
  {
    header: "Network",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.code}
        </span>
      </div>
    ),
  },
  {
    header: "Chain ID",
    cell: ({ row }) =>
      row.original.chainId != null ? (
        <span className="tabular-nums">{row.original.chainId}</span>
      ) : (
        <span className="text-muted-foreground">Non-EVM</span>
      ),
  },
  {
    header: "Native asset",
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.original.nativeAssetSymbol ?? "—"}
      </span>
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
    cell: ({ row }) => <RowActions network={row.original} />,
  },
];

export function NetworksTable({
  networks,
  loading,
}: {
  networks: NetworkEntity[];
  loading?: boolean;
}) {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      data={networks}
      loading={loading}
      getRowId={(n) => n.id}
      onRowClick={(n) => router.push(`/admin/networks/${n.id}`)}
      emptyState={
        <EmptyState
          icon={NetworkIcon}
          title="No networks yet"
          description="Add a blockchain network to start configuring assets."
          className="border-0 py-12"
        />
      }
    />
  );
}
