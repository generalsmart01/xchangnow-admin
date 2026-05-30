"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { rejectTransaction } from "@/lib/api/transactions";
import type { RejectBody, Transaction } from "@/lib/types/transaction";

export function RejectDialog({
  transaction,
  open,
  onOpenChange,
}: {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState("");

  const mutation = useMutationToast<Transaction, RejectBody>(
    (body) => rejectTransaction(transaction.id, body).then((r) => r.data),
    {
      successMessage: "Transaction rejected",
      invalidate: [
        ["transactions"],
        ["transaction", transaction.id],
        ["dashboard"],
      ],
      onSuccess: () => {
        setReason("");
        onOpenChange(false);
      },
    },
  );

  const valid = reason.trim().length >= 3;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reject transaction"
      description={
        <>
          Reject <span className="font-mono">{transaction.referenceCode}</span>?
          The customer will see the reason below.
        </>
      }
      confirmText="Reject"
      variant="destructive"
      loading={mutation.isPending}
      disabled={!valid}
      onConfirm={() => mutation.mutate({ reason: reason.trim() })}
    >
      <div className="space-y-2">
        <Label htmlFor="reject-reason">
          Reason <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="reject-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Receipt unreadable; please re-submit a clearer image"
          rows={3}
          autoFocus
        />
      </div>
    </ConfirmDialog>
  );
}
