"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CopyButtonProps = {
  value: string;
  label?: string;
  className?: string;
  size?: "icon" | "sm";
};

export function CopyButton({ value, label, className, size = "icon" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(label ? `${label} copied` : "Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size === "icon" ? "icon" : "sm"}
      className={cn(size === "icon" && "size-7", className)}
      onClick={handleCopy}
      aria-label={label ? `Copy ${label}` : "Copy"}
    >
      {copied ? (
        <Check className="size-3.5 text-success" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {size === "sm" ? <span>{copied ? "Copied" : "Copy"}</span> : null}
    </Button>
  );
}
