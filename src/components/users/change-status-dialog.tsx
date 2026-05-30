"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { updateUserStatus } from "@/lib/api/users";
import type { AdminUser, UpdateStatusBody, UserStatus } from "@/lib/types/user";
import { titleCase } from "@/lib/labels";

export function ChangeStatusDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isSuspendOnly } = useAuth();

  // CUSTOMER_SERVICE may only suspend; others can suspend or reactivate.
  const targets: UserStatus[] = isSuspendOnly
    ? ["SUSPENDED"]
    : ["ACTIVE", "SUSPENDED"];

  const [status, setStatus] = useState<UserStatus>(targets[0]);
  const [reason, setReason] = useState("");

  const mutation = useMutationToast<AdminUser, UpdateStatusBody>(
    (body) => updateUserStatus(user.id, body).then((r) => r.data),
    {
      successMessage: (u) => `Status changed to ${titleCase(u.status)}`,
      invalidate: [["users"], ["user", user.id]],
      onSuccess: () => {
        setReason("");
        onOpenChange(false);
      },
    },
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !mutation.isPending && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change account status</DialogTitle>
          <DialogDescription>
            Update the status for {user.email}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>New status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as UserStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {targets.map((t) => (
                  <SelectItem key={t} value={t}>
                    {titleCase(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-reason">Reason (optional)</Label>
            <Textarea
              id="status-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Suspicious withdrawal pattern"
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
            variant={status === "SUSPENDED" ? "destructive" : "default"}
            onClick={() =>
              mutation.mutate({ status, reason: reason.trim() || undefined })
            }
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {status === "SUSPENDED" ? "Suspend" : `Set ${titleCase(status)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
