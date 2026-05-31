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
import { Switch } from "@/components/ui/switch";
import { AssetIcon } from "@/components/shared/asset-icon";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { createAsset, updateAsset } from "@/lib/api/assets";
import type { Asset, CreateAssetBody, UpdateAssetBody } from "@/lib/types/asset";

const schema = z.object({
  symbol: z
    .string()
    .regex(/^[A-Z0-9]{2,10}$/, "2–10 uppercase letters/digits"),
  name: z.string().min(1, "Required"),
  decimals: z
    .string()
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 0 && n <= 18;
    }, "0–18"),
  iconUrl: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
  sortOrder: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function AssetForm({ asset }: { asset?: Asset }) {
  const router = useRouter();
  const isEdit = !!asset;
  const [isEnabled, setIsEnabled] = useState(asset?.isEnabled ?? true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      symbol: asset?.symbol ?? "",
      name: asset?.name ?? "",
      decimals: asset?.decimals != null ? String(asset.decimals) : "18",
      iconUrl: asset?.iconUrl ?? "",
      sortOrder: asset?.sortOrder != null ? String(asset.sortOrder) : "",
    },
  });

  const symbol = watch("symbol");
  const iconUrl = watch("iconUrl");

  const createMutation = useMutationToast<Asset, CreateAssetBody>(
    (body) => createAsset(body).then((r) => r.data),
    {
      successMessage: "Asset created",
      invalidate: [["assets"]],
      onSuccess: (a) => router.push(`/admin/assets/${a.id}`),
    },
  );

  const updateMutation = useMutationToast<Asset, UpdateAssetBody>(
    (body) => updateAsset(asset!.id, body).then((r) => r.data),
    {
      successMessage: "Asset updated",
      invalidate: [["assets"], ["asset", asset?.id ?? ""]],
      onSuccess: () => router.push("/admin/assets"),
    },
  );

  const pending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: FormValues) {
    const sortOrder = values.sortOrder?.trim() ? Number(values.sortOrder) : undefined;
    if (isEdit) {
      updateMutation.mutate({
        name: values.name.trim(),
        iconUrl: values.iconUrl?.trim() || null,
        sortOrder,
        isEnabled,
      });
    } else {
      createMutation.mutate({
        symbol: values.symbol.trim(),
        name: values.name.trim(),
        decimals: Number(values.decimals),
        iconUrl: values.iconUrl?.trim() || undefined,
        sortOrder,
        isEnabled,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol</Label>
          <Input
            id="symbol"
            placeholder="SOL"
            className="font-mono uppercase"
            disabled={isEdit}
            {...register("symbol")}
          />
          {isEdit ? (
            <p className="text-xs text-muted-foreground">Symbol is immutable.</p>
          ) : errors.symbol ? (
            <p className="text-xs text-destructive">{errors.symbol.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="decimals">Decimals</Label>
          <Input
            id="decimals"
            inputMode="numeric"
            placeholder="9"
            disabled={isEdit}
            {...register("decimals")}
          />
          {isEdit ? (
            <p className="text-xs text-muted-foreground">Decimals are immutable.</p>
          ) : errors.decimals ? (
            <p className="text-xs text-destructive">{errors.decimals.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Solana" {...register("name")} />
        {errors.name ? (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="iconUrl">Icon URL</Label>
        <div className="flex items-center gap-3">
          <AssetIcon symbol={symbol || "?"} iconUrl={iconUrl || null} className="size-9" />
          <Input
            id="iconUrl"
            placeholder="https://cryptologos.cc/logos/solana-sol-logo.png"
            className="font-mono text-xs"
            {...register("iconUrl")}
          />
        </div>
        {errors.iconUrl ? (
          <p className="text-xs text-destructive">{errors.iconUrl.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input
          id="sortOrder"
          inputMode="numeric"
          placeholder="80"
          className="max-w-[120px]"
          {...register("sortOrder")}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="isEnabled">Enabled</Label>
          <p className="text-xs text-muted-foreground">
            Disabled assets are hidden from customers.
          </p>
        </div>
        <Switch id="isEnabled" checked={isEnabled} onCheckedChange={setIsEnabled} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create asset"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/assets")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
