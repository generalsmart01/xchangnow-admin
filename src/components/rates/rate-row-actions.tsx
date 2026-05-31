"use client";

import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleGate } from "@/components/layout/role-gate";
import { useConfirm } from "@/lib/hooks/use-confirm";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { deleteRate } from "@/lib/api/rates";
import type { FxRate } from "@/lib/types/rate";

/**
 * Row actions for a rate snapshot. View is available to everyone; Edit and
 * Delete are gated by `rates.manage` (SUPER_ADMIN + ADMIN). `stopPropagation`
 * keeps clicks from also triggering the row's navigate-to-detail handler.
 */
export function RateRowActions({ rate }: { rate: FxRate }) {
  const router = useRouter();
  const confirm = useConfirm();

  const remove = useMutationToast<null, void>(
    () => deleteRate(rate.id).then((r) => r.data),
    { successMessage: "Rate snapshot deleted", invalidate: [["rates"]] },
  );

  const open = () => router.push(`/admin/rates/${rate.id}`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={open}>
          <Eye className="size-4" /> View
        </DropdownMenuItem>
        <RoleGate cap="rates.manage">
          <DropdownMenuItem onSelect={open}>
            <Pencil className="size-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={remove.isPending}
            onSelect={async (e) => {
              e.preventDefault();
              const ok = await confirm({
                title: "Delete this FX rate?",
                description:
                  "This permanently removes the rate snapshot. It won't affect transactions that already used it.",
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
