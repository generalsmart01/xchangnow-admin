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
import { changeStaffRole } from "@/lib/api/staff";
import { ASSIGNABLE_STAFF_ROLES, type ChangeRoleBody } from "@/lib/types/staff";
import type { AdminUser, Role } from "@/lib/types/user";
import { titleCase } from "@/lib/labels";

export function ChangeRoleDialog({
  staff,
  open,
  onOpenChange,
}: {
  staff: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [role, setRole] = useState<Role>(
    ASSIGNABLE_STAFF_ROLES.includes(staff.role) ? staff.role : "OPS",
  );
  const [reason, setReason] = useState("");

  const mutation = useMutationToast<AdminUser, ChangeRoleBody>(
    (body) => changeStaffRole(staff.id, body).then((r) => r.data),
    {
      successMessage: (u) => `Role changed to ${titleCase(u.role)}`,
      invalidate: [["staff"], ["staff", staff.id]],
      onSuccess: () => {
        setReason("");
        onOpenChange(false);
      },
    },
  );

  const valid = reason.trim().length >= 3 && role !== staff.role;

  return (
    <Dialog open={open} onOpenChange={(o) => !mutation.isPending && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            Update the role for {staff.email}. SUPER_ADMIN cannot be assigned here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>New role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNABLE_STAFF_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {titleCase(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="role-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Promoted from OPS after Q2 review"
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
            onClick={() => mutation.mutate({ role, reason: reason.trim() })}
            disabled={!valid || mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Change role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
