"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { approveTransaction } from "@/lib/api/transactions";
import type { ApproveBody, Transaction } from "@/lib/types/transaction";

export function ApproveDialog({
  transaction,
  open,
  onOpenChange,
}: {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [notes, setNotes] = useState("");

  const mutation = useMutationToast<Transaction, ApproveBody>(
    (body) => approveTransaction(transaction.id, body).then((r) => r.data),
    {
      successMessage: "Transaction approved",
      invalidate: [
        ["transactions"],
        ["transaction", transaction.id],
        ["payouts"],
        ["dashboard"],
      ],
      onSuccess: () => {
        setNotes("");
        onOpenChange(false);
      },
    },
  );

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Approve transaction"
      description={
        <>
          Approve <span className="font-mono">{transaction.referenceCode}</span>?
          {transaction.type === "SELL"
            ? " A pending payout will be created automatically."
            : ""}
        </>
      }
      confirmText="Approve"
      loading={mutation.isPending}
      onConfirm={() => mutation.mutate({ notes: notes.trim() || undefined })}
    >
      <div className="space-y-2">
        <Label htmlFor="approve-notes">Notes (optional)</Label>
        <Textarea
          id="approve-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Tx hash verified on Blockstream — 6 confirmations"
          rows={3}
        />
      </div>
    </ConfirmDialog>
  );
}
