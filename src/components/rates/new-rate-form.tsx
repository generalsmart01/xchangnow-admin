"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { createRate } from "@/lib/api/rates";
import type { CreateRateBody, FxRate } from "@/lib/types/rate";

const decimalString = z
  .string()
  .min(1, "Required")
  .refine((v) => Number(v) > 0 && !Number.isNaN(Number(v)), "Enter a positive amount");

const schema = z
  .object({
    buyRate: decimalString,
    sellRate: decimalString,
    source: z.string().optional(),
  })
  // Backend refuses sellRate >= buyRate (inverted spread drains the float).
  .refine((v) => Number(v.sellRate) < Number(v.buyRate), {
    message: "Sell rate must be below buy rate",
    path: ["sellRate"],
  });
type FormValues = z.infer<typeof schema>;

export function NewRateForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { source: "manual" },
  });

  const mutation = useMutationToast<FxRate, CreateRateBody>(
    (body) => createRate(body).then((r) => r.data),
    {
      successMessage: "FX rate recorded",
      invalidate: [["rates"]],
      onSuccess: () => router.push("/admin/rates"),
    },
  );

  function onSubmit(values: FormValues) {
    mutation.mutate({
      buyRate: values.buyRate,
      sellRate: values.sellRate,
      fiatCurrency: "NGN",
      source: values.source?.trim() || "manual",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="buyRate">Buy rate (NGN per USD)</Label>
          <Input
            id="buyRate"
            inputMode="decimal"
            placeholder="1380.0000"
            {...register("buyRate")}
          />
          <p className="text-xs text-muted-foreground">
            Charged on customer BUY orders.
          </p>
          {errors.buyRate ? (
            <p className="text-xs text-destructive">{errors.buyRate.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellRate">Sell rate (NGN per USD)</Label>
          <Input
            id="sellRate"
            inputMode="decimal"
            placeholder="1360.0000"
            {...register("sellRate")}
          />
          <p className="text-xs text-muted-foreground">
            Paid out on customer SELL orders.
          </p>
          {errors.sellRate ? (
            <p className="text-xs text-destructive">{errors.sellRate.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source (optional)</Label>
        <Input id="source" placeholder="manual" {...register("source")} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save FX rate
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/rates")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
