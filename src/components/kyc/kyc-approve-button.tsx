"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { approveKyc } from "@/lib/api/kyc";
import type { KycReviewResult } from "@/lib/types/kyc";

export function KycApproveButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  const mutation = useMutationToast<KycReviewResult, void>(
    () => approveKyc(userId).then((r) => r.data),
    {
      successMessage: "KYC submission approved",
      invalidate: [["kyc"], ["kyc", userId], ["dashboard"]],
      onSuccess: () => setOpen(false),
    },
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <CheckCircle2 className="size-4" /> Approve
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Approve KYC submission"
        description="Confirm the identity documents match the customer's profile."
        confirmText="Approve"
        loading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
      />
    </>
  );
}
