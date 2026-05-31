"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { rejectKyc } from "@/lib/api/kyc";
import type { KycReviewResult, KycRejectBody } from "@/lib/types/kyc";

export function KycRejectDialog({
  userId,
  open,
  onOpenChange,
}: {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState("");

  const mutation = useMutationToast<KycReviewResult, KycRejectBody>(
    (body) => rejectKyc(userId, body).then((r) => r.data),
    {
      successMessage: "KYC submission rejected",
      invalidate: [["kyc"], ["kyc", userId], ["dashboard"]],
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
      title="Reject KYC submission"
      description="The customer will be asked to re-submit with the reason below."
      confirmText="Reject"
      variant="destructive"
      loading={mutation.isPending}
      disabled={!valid}
      onConfirm={() => mutation.mutate({ reason: reason.trim() })}
    >
      <div className="space-y-2">
        <Label htmlFor="kyc-reject-reason">
          Reason <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="kyc-reject-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Selfie is too blurry to verify. Please retake in better lighting."
          rows={3}
          autoFocus
        />
      </div>
    </ConfirmDialog>
  );
}
