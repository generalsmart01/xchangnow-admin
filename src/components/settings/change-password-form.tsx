"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { changePassword } from "@/lib/api/account";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: "New password must differ from the current one",
    path: ["newPassword"],
  });
type FormValues = z.infer<typeof schema>;

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutationToast<{ message: string }, FormValues>(
    (values) =>
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).then((r) => r.data),
    {
      successMessage:
        "Password changed — your other sessions have been signed out.",
      onSuccess: () => reset(),
    },
  );

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <PasswordInput
          id="currentPassword"
          autoComplete="current-password"
          {...register("currentPassword")}
        />
        {errors.currentPassword ? (
          <p className="text-xs text-destructive">
            {errors.currentPassword.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            {...register("newPassword")}
          />
          {errors.newPassword ? (
            <p className="text-xs text-destructive">
              {errors.newPassword.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <PasswordInput
            id="confirm"
            autoComplete="new-password"
            {...register("confirm")}
          />
          {errors.confirm ? (
            <p className="text-xs text-destructive">{errors.confirm.message}</p>
          ) : null}
        </div>
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Change password
      </Button>
    </form>
  );
}
