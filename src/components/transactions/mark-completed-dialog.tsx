"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { markTransactionCompleted } from "@/lib/api/transactions";
import type { MarkCompletedBody, Transaction } from "@/lib/types/transaction";

export function MarkCompletedDialog({
  transaction,
  open,
  onOpenChange,
}: {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [outboundTxHash, setOutboundTxHash] = useState("");
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [notes, setNotes] = useState("");

  const mutation = useMutationToast<Transaction, MarkCompletedBody>(
    (body) => markTransactionCompleted(transaction.id, body).then((r) => r.data),
    {
      successMessage: "Transaction marked completed",
      invalidate: [
        ["transactions"],
        ["transaction", transaction.id],
        ["dashboard"],
      ],
      onSuccess: () => {
        setOutboundTxHash("");
        setProofImageUrl("");
        setNotes("");
        onOpenChange(false);
      },
    },
  );

  // Both the outbound hash AND a proof image are now required.
  const valid = outboundTxHash.trim().length > 0 && proofImageUrl !== "";

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Mark as completed"
      description={
        <>
          Confirm the crypto was sent for{" "}
          <span className="font-mono">{transaction.referenceCode}</span>.
        </>
      }
      confirmText="Mark completed"
      loading={mutation.isPending}
      disabled={!valid}
      onConfirm={() =>
        mutation.mutate({
          outboundTxHash: outboundTxHash.trim(),
          proofImageUrl,
          notes: notes.trim() || undefined,
        })
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="outbound-hash">
            Outbound tx hash <span className="text-destructive">*</span>
          </Label>
          <Input
            id="outbound-hash"
            value={outboundTxHash}
            onChange={(e) => setOutboundTxHash(e.target.value)}
            placeholder="0xabc1234…567890"
            className="font-mono"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label>
            Proof image <span className="text-destructive">*</span>
          </Label>
          <ImageUploadField
            value={proofImageUrl}
            onChange={setProofImageUrl}
            purpose="TRANSACTION_PROOF"
            buttonLabel="Upload proof"
          />
          <p className="text-xs text-muted-foreground">
            Screenshot of the outbound send, for dispute reconciliation.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="completed-notes">Notes (optional)</Label>
          <Textarea
            id="completed-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Sent via Tron hot wallet at 14:25 GMT"
            rows={2}
          />
        </div>
      </div>
    </ConfirmDialog>
  );
}
