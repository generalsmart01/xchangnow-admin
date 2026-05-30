"use client";

import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
  disabled?: boolean;
  onConfirm: () => void;
  children?: ReactNode;
};

/** Controlled confirm dialog. Pass extra inputs via `children`. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
  disabled = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription asChild>
              <div>{description}</div>
            </DialogDescription>
          ) : null}
        </DialogHeader>

        {children ? <div className="py-1">{children}</div> : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={loading || disabled}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
