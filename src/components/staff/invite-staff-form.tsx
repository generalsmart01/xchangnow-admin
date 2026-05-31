"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/lib/hooks/use-toast";
import { inviteStaff } from "@/lib/api/staff";
import { ASSIGNABLE_STAFF_ROLES } from "@/lib/types/staff";
import { titleCase } from "@/lib/labels";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  role: z.enum(["ADMIN", "OPS", "CUSTOMER_SERVICE"]),
});
type FormValues = z.infer<typeof schema>;

export function InviteStaffForm() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "OPS" },
  });

  const role = watch("role");

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const data = await inviteStaff({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role,
      }).then((r) => r.data);

      toast.success(`Invite email sent to ${data.email}`);
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
      router.push("/admin/staff");
    } catch (err) {
      toast.error(err, "Couldn't send invite");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="ops1@xchangnow.com" {...register("email")} />
        {errors.email ? (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" placeholder="Tunde" {...register("firstName")} />
          {errors.firstName ? (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" placeholder="Bello" {...register("lastName")} />
          {errors.lastName ? (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={role}
          onValueChange={(v) => setValue("role", v as FormValues["role"])}
        >
          <SelectTrigger className="sm:w-[240px]">
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

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Send invite
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/staff")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
