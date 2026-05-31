"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Power, Wallet as WalletIcon } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToneBadge } from "@/components/shared/tone-badge";
import { WalletAddressDisplay } from "./wallet-address-display";
import { RoleGate } from "@/components/layout/role-gate";
import { useConfirm } from "@/lib/hooks/use-confirm";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { deactivateWallet } from "@/lib/api/wallets";
import { assetSymbol, networkName } from "@/lib/asset-display";
import type { Wallet } from "@/lib/types/wallet";

function RowActions({ wallet }: { wallet: Wallet }) {
  const router = useRouter();
  const confirm = useConfirm();

  const mutation = useMutationToast<Wallet, void>(
    () => deactivateWallet(wallet.id).then((r) => r.data),
    { successMessage: "Wallet deactivated", invalidate: [["wallets"]] },
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => router.push(`/admin/wallets/${wallet.id}`)}>
          <Pencil className="size-4" /> Edit
        </DropdownMenuItem>
        <RoleGate cap="wallets.manage">
          <DropdownMenuItem
            variant="destructive"
            disabled={!wallet.isActive || mutation.isPending}
            onSelect={async (e) => {
              e.preventDefault();
              const ok = await confirm({
                title: "Deactivate wallet?",
                description:
                  "Customers will no longer be offered this address. You can re-enable it later by editing.",
                confirmText: "Deactivate",
                variant: "destructive",
              });
              if (ok) mutation.mutate();
            }}
          >
            <Power className="size-4" /> Deactivate
          </DropdownMenuItem>
        </RoleGate>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns: ColumnDef<Wallet>[] = [
  {
    header: "Asset",
    cell: ({ row }) => (
      <span className="font-medium">{assetSymbol(row.original.assetNetwork)}</span>
    ),
  },
  {
    header: "Network",
    cell: ({ row }) => networkName(row.original.assetNetwork),
  },
  {
    header: "Address",
    cell: ({ row }) => <WalletAddressDisplay address={row.original.address} />,
  },
  {
    header: "Label",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.label ?? "—"}
      </span>
    ),
  },
  {
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <ToneBadge tone="success" dot>
          Active
        </ToneBadge>
      ) : (
        <ToneBadge tone="muted" dot>
          Inactive
        </ToneBadge>
      ),
  },
  {
    header: "",
    id: "actions",
    cell: ({ row }) => <RowActions wallet={row.original} />,
  },
];

export function WalletsTable({
  wallets,
  loading,
}: {
  wallets: Wallet[];
  loading?: boolean;
}) {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      data={wallets}
      loading={loading}
      getRowId={(w) => w.id}
      onRowClick={(w) => router.push(`/admin/wallets/${w.id}`)}
      emptyState={
        <EmptyState
          icon={WalletIcon}
          title="No wallets yet"
          description="Add a hot wallet address to start receiving deposits."
          className="border-0 py-12"
        />
      }
    />
  );
}
