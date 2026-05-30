"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { updatePayoutStatus } from "@/lib/api/payouts";
import type { Payout, PayoutStatus, UpdatePayoutStatusBody } from "@/lib/types/payout";
import { titleCase } from "@/lib/labels";

/** Allowed next states from each payout status. */
export const PAYOUT_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
  PENDING: ["PROCESSING", "FAILED"],
  PROCESSING: ["PAID", "FAILED"],
  FAILED: ["PROCESSING"],
  PAID: [],
};

export function UpdateStatusDialog({
  payout,
  target,
  open,
  onOpenChange,
}: {
  payout: Payout;
  target: PayoutStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reference, setReference] = useState("");
  const [failureReason, setFailureReason] = useState("");

  const mutation = useMutationToast<Payout, UpdatePayoutStatusBody>(
    (body) => updatePayoutStatus(payout.id, body).then((r) => r.data),
    {
      successMessage:
        target === "PAID"
          ? "Payout marked paid — transaction completed"
          : `Payout set to ${titleCase(target)}`,
      invalidate: [
        ["payouts"],
        ["payout", payout.id],
        ["transactions"],
        ["transaction", payout.transactionId],
        ["dashboard"],
      ],
      onSuccess: () => {
        setReference("");
        setFailureReason("");
        onOpenChange(false);
      },
    },
  );

  const failureValid = target !== "FAILED" || failureReason.trim().length >= 3;

  function submit() {
    const body: UpdatePayoutStatusBody = { status: target };
    if (target === "PROCESSING" && reference.trim()) body.reference = reference.trim();
    if (target === "FAILED") body.failureReason = failureReason.trim();
    mutation.mutate(body);
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Mark payout as ${titleCase(target)}`}
      description={
        <>
          Update <span className="font-mono">{payout.reference}</span> to{" "}
          <span className="font-medium">{titleCase(target)}</span>.
        </>
      }
      confirmText={`Set ${titleCase(target)}`}
      variant={target === "FAILED" ? "destructive" : "default"}
      loading={mutation.isPending}
      disabled={!failureValid}
      onConfirm={submit}
    >
      <div className="space-y-3">
        {target === "PAID" ? (
          <Alert>
            <Info className="size-4" />
            <AlertDescription>
              This completes the parent transaction and creates a referral
              commission if the customer was referred. It cannot be undone.
            </AlertDescription>
          </Alert>
        ) : null}

        {target === "PROCESSING" ? (
          <div className="space-y-2">
            <Label htmlFor="bank-ref">Bank reference (optional)</Label>
            <Input
              id="bank-ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="BANK-TXN-9988"
              className="font-mono"
            />
          </div>
        ) : null}

        {target === "FAILED" ? (
          <div className="space-y-2">
            <Label htmlFor="failure-reason">
              Failure reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="failure-reason"
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              placeholder="e.g. Beneficiary bank rejected transfer"
              rows={3}
              autoFocus
            />
          </div>
        ) : null}
      </div>
    </ConfirmDialog>
  );
}
