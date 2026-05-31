"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RoleBadge } from "@/components/staff/role-badge";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { useAuth } from "@/lib/hooks/use-auth";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { updateMe } from "@/lib/api/users";
import type { SelfUser } from "@/lib/types/user";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phoneNumber: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const { user, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber ?? "",
    },
  });

  const mutation = useMutationToast<SelfUser, FormValues>(
    (body) =>
      updateMe({
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber?.trim() || undefined,
      }).then((r) => r.data),
    {
      successMessage: "Profile updated",
      invalidate: [["me"]],
      onSuccess: (updated) => setUser(updated),
    },
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your own profile."
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Role</span>
              <RoleBadge role={user.role} />
            </div>
          </div>

          <Separator />

          <form
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName ? (
                  <p className="text-xs text-destructive">
                    {errors.firstName.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName ? (
                  <p className="text-xs text-destructive">
                    {errors.lastName.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input
                id="phoneNumber"
                placeholder="+2348012345678"
                {...register("phoneNumber")}
              />
            </div>

            <Button type="submit" disabled={mutation.isPending || !isDirty}>
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Changing your password signs you out of all other devices. You stay
            signed in here.
          </p>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
