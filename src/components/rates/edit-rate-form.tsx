"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirm } from "@/lib/hooks/use-confirm";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { deleteRate, updateRate } from "@/lib/api/rates";
import type { FxRate, UpdateRateBody } from "@/lib/types/rate";

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
  .refine((v) => Number(v.sellRate) < Number(v.buyRate), {
    message: "Sell rate must be below buy rate",
    path: ["sellRate"],
  });
type FormValues = z.infer<typeof schema>;

/**
 * Edit + delete for a single FX rate snapshot. fiatCurrency is immutable (this
 * is a typo-fix). Gated by `rates.manage` at the page level.
 */
export function EditRateForm({ rate }: { rate: FxRate }) {
  const router = useRouter();
  const confirm = useConfirm();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      buyRate: rate.buyRate,
      sellRate: rate.sellRate,
      source: rate.source,
    },
  });

  const update = useMutationToast<FxRate, UpdateRateBody>(
    (body) => updateRate(rate.id, body).then((r) => r.data),
    {
      successMessage: "FX rate updated",
      invalidate: [["rates"], ["rate", rate.id]],
    },
  );

  const remove = useMutationToast<null, void>(
    () => deleteRate(rate.id).then((r) => r.data),
    {
      successMessage: "FX rate deleted",
      invalidate: [["rates"]],
      onSuccess: () => router.push("/admin/rates"),
    },
  );

  function onSubmit(values: FormValues) {
    update.mutate({
      buyRate: values.buyRate,
      sellRate: values.sellRate,
      source: values.source?.trim() || undefined,
    });
  }

  async function onDelete() {
    const ok = await confirm({
      title: "Delete this FX rate?",
      description:
        "This permanently removes the rate snapshot. Transactions that already used it keep their captured rate.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (ok) remove.mutate();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="buyRate">Buy rate ({rate.fiatCurrency} per USD)</Label>
          <Input id="buyRate" inputMode="decimal" {...register("buyRate")} />
          {errors.buyRate ? (
            <p className="text-xs text-destructive">{errors.buyRate.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellRate">Sell rate ({rate.fiatCurrency} per USD)</Label>
          <Input id="sellRate" inputMode="decimal" {...register("sellRate")} />
          {errors.sellRate ? (
            <p className="text-xs text-destructive">{errors.sellRate.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Input id="source" placeholder="manual" {...register("source")} />
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save changes
        </Button>
        <Button
          type="button"
          variant="outline"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={remove.isPending}
          onClick={onDelete}
        >
          {remove.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Delete
        </Button>
      </div>
    </form>
  );
}
