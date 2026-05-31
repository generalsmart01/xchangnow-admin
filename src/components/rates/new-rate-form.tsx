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
import { AssetSelect } from "@/components/shared/entity-selects";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { createRate } from "@/lib/api/rates";
import type { CreateRateBody, RateSnapshot } from "@/lib/types/rate";

const decimalString = z
  .string()
  .min(1, "Required")
  .refine((v) => Number(v) > 0 && !Number.isNaN(Number(v)), "Enter a positive amount");

const schema = z.object({
  buyRate: decimalString,
  sellRate: decimalString,
  source: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function NewRateForm() {
  const router = useRouter();
  const [assetId, setAssetId] = useState("");
  const [assetError, setAssetError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { source: "manual" },
  });

  const mutation = useMutationToast<RateSnapshot, CreateRateBody>(
    (body) => createRate(body).then((r) => r.data),
    {
      successMessage: "Rate snapshot recorded",
      invalidate: [["rates"]],
      onSuccess: () => router.push("/admin/rates"),
    },
  );

  function onSubmit(values: FormValues) {
    if (!assetId) {
      setAssetError("Select an asset");
      return;
    }
    mutation.mutate({
      assetId,
      buyRate: values.buyRate,
      sellRate: values.sellRate,
      fiatCurrency: "NGN",
      source: values.source?.trim() || "manual",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
      <div className="space-y-2">
        <Label>Asset</Label>
        <AssetSelect
          value={assetId}
          onChange={(v) => {
            setAssetId(v);
            setAssetError(null);
          }}
        />
        {assetError ? (
          <p className="text-xs text-destructive">{assetError}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="buyRate">Buy rate (NGN)</Label>
          <Input
            id="buyRate"
            inputMode="decimal"
            placeholder="70500000.00"
            {...register("buyRate")}
          />
          {errors.buyRate ? (
            <p className="text-xs text-destructive">{errors.buyRate.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellRate">Sell rate (NGN)</Label>
          <Input
            id="sellRate"
            inputMode="decimal"
            placeholder="68500000.00"
            {...register("sellRate")}
          />
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
          Save snapshot
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
