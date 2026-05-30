"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useToast } from "./use-toast";

type ToastMutationOptions<TData, TVars> = UseMutationOptions<
  TData,
  unknown,
  TVars
> & {
  successMessage?: string | ((data: TData, vars: TVars) => string);
  errorFallback?: string;
  /** Query keys to invalidate on success. */
  invalidate?: unknown[][];
};

/**
 * useMutation + automatic success/error toasts + query invalidation.
 * The requestId is surfaced on failures via the toast description.
 */
export function useMutationToast<TData, TVars>(
  mutationFn: (vars: TVars) => Promise<TData>,
  options: ToastMutationOptions<TData, TVars> = {},
) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { successMessage, errorFallback, invalidate, ...rest } = options;

  return useMutation<TData, unknown, TVars>({
    mutationFn,
    ...rest,
    onSuccess: (...args) => {
      const [data, vars] = args;
      if (successMessage) {
        const msg =
          typeof successMessage === "function"
            ? successMessage(data, vars)
            : successMessage;
        toast.success(msg);
      }
      if (invalidate) {
        for (const key of invalidate) {
          void queryClient.invalidateQueries({ queryKey: key });
        }
      }
      rest.onSuccess?.(...args);
    },
    onError: (...args) => {
      const [err] = args;
      toast.error(err, errorFallback);
      rest.onError?.(...args);
    },
  });
}
