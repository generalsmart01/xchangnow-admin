"use client";

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
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { createRate } from "@/lib/api/rates";
import { CRYPTO_ASSETS, type CryptoAsset } from "@/lib/types/transaction";
import type { CreateRateBody, RateSnapshot } from "@/lib/types/rate";

const decimalString = z
  .string()
  .min(1, "Required")
  .refine((v) => Number(v) > 0 && !Number.isNaN(Number(v)), "Enter a positive amount");

const schema = z.object({
  asset: z.enum(CRYPTO_ASSETS),
  buyRate: decimalString,
  sellRate: decimalString,
  source: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function NewRateForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { asset: "BTC", source: "manual" },
  });

  const asset = watch("asset");

  const mutation = useMutationToast<RateSnapshot, CreateRateBody>(
    (body) => createRate(body).then((r) => r.data),
    {
      successMessage: "Rate snapshot recorded",
      invalidate: [["rates"], ["rates", "current"]],
      onSuccess: () => router.push("/admin/rates"),
    },
  );

  function onSubmit(values: FormValues) {
    mutation.mutate({
      asset: values.asset,
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
        <Select
          value={asset}
          onValueChange={(v) => setValue("asset", v as CryptoAsset)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CRYPTO_ASSETS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
