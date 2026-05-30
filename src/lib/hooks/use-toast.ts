"use client";

import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

/** sonner wrapper that surfaces the requestId on errors for log correlation. */
export function useToast() {
  return {
    success: (message: string, description?: string) =>
      toast.success(message, { description }),
    error: (err: unknown, fallback = "Something went wrong") => {
      if (err instanceof ApiError) {
        toast.error(err.message || fallback, {
          description: err.requestId ? `Reference: ${err.requestId}` : undefined,
        });
        return;
      }
      const message = err instanceof Error ? err.message : fallback;
      toast.error(message);
    },
    info: (message: string, description?: string) =>
      toast.message(message, { description }),
    raw: toast,
  };
}
