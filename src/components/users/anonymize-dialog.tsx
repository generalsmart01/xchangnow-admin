"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldAlert } from "lucide-react";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { anonymizeUser } from "@/lib/api/users";
import type { AdminUser, AnonymizeBody, AnonymizeResponse } from "@/lib/types/user";

export function AnonymizeDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [reason, setReason] = useState("");

  const mutation = useMutationToast<AnonymizeResponse, AnonymizeBody>(
    (body) => anonymizeUser(user.id, body).then((r) => r.data),
    {
      successMessage: "User anonymized",
      invalidate: [["users"], ["user", user.id]],
      onSuccess: () => {
        onOpenChange(false);
        router.push("/admin/users");
      },
    },
  );

  const emailMatches = confirmEmail.trim().toLowerCase() === user.email.toLowerCase();
  const reasonValid = reason.trim().length >= 5;

  return (
    <Dialog open={open} onOpenChange={(o) => !mutation.isPending && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anonymize user</DialogTitle>
          <DialogDescription>
            Right-to-be-forgotten. This permanently scrubs the customer&apos;s
            personal data and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <ShieldAlert className="size-4" />
            <AlertTitle>This is irreversible</AlertTitle>
            <AlertDescription>
              Type the exact email below to confirm you are anonymizing the right
              account.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirm-email">
              Confirm email — <span className="font-mono">{user.email}</span>
            </Label>
            <Input
              id="confirm-email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={user.email}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anonymize-reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="anonymize-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. User requested account deletion under NDPR Article 26"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!emailMatches || !reasonValid || mutation.isPending}
            onClick={() =>
              mutation.mutate({
                confirmEmail: confirmEmail.trim(),
                reason: reason.trim(),
              })
            }
          >
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Anonymize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
