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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WalletAddressDisplay } from "./wallet-address-display";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { createWallet, updateWallet } from "@/lib/api/wallets";
import {
  CRYPTO_ASSETS,
  NETWORKS,
  type CryptoAsset,
  type Network,
} from "@/lib/types/transaction";
import type {
  CreateWalletBody,
  UpdateWalletBody,
  Wallet,
} from "@/lib/types/wallet";

const schema = z.object({
  cryptoAsset: z.enum(CRYPTO_ASSETS),
  network: z.enum(NETWORKS),
  address: z.string().min(6, "Enter a valid address"),
  label: z.string().optional(),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function WalletForm({ wallet }: { wallet?: Wallet }) {
  const router = useRouter();
  const isEdit = !!wallet;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cryptoAsset: wallet?.cryptoAsset ?? "BTC",
      network: wallet?.network ?? "BITCOIN",
      address: wallet?.address ?? "",
      label: wallet?.label ?? "",
      isActive: wallet?.isActive ?? true,
    },
  });

  const [isActive, setIsActive] = useState(wallet?.isActive ?? true);
  const cryptoAsset = watch("cryptoAsset");
  const network = watch("network");

  const createMutation = useMutationToast<Wallet, CreateWalletBody>(
    (body) => createWallet(body).then((r) => r.data),
    {
      successMessage: "Wallet created",
      invalidate: [["wallets"]],
      onSuccess: () => router.push("/admin/wallets"),
    },
  );

  const updateMutation = useMutationToast<Wallet, UpdateWalletBody>(
    (body) => updateWallet(wallet!.id, body).then((r) => r.data),
    {
      successMessage: "Wallet updated",
      invalidate: [["wallets"], ["wallet", wallet?.id ?? ""]],
      onSuccess: () => router.push("/admin/wallets"),
    },
  );

  const pending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: FormValues) {
    if (isEdit) {
      updateMutation.mutate({ label: values.label?.trim() || undefined, isActive });
    } else {
      createMutation.mutate({
        cryptoAsset: values.cryptoAsset,
        network: values.network,
        address: values.address.trim(),
        label: values.label?.trim() || undefined,
        isActive,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Asset</Label>
          {isEdit ? (
            <Input value={cryptoAsset} disabled />
          ) : (
            <Select
              value={cryptoAsset}
              onValueChange={(v) => setValue("cryptoAsset", v as CryptoAsset)}
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
          )}
        </div>
        <div className="space-y-2">
          <Label>Network</Label>
          {isEdit ? (
            <Input value={network} disabled />
          ) : (
            <Select
              value={network}
              onValueChange={(v) => setValue("network", v as Network)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NETWORKS.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        {isEdit ? (
          <div className="rounded-md border bg-muted/40 px-3 py-2">
            <WalletAddressDisplay address={wallet!.address} truncate={false} />
          </div>
        ) : (
          <>
            <Input
              id="address"
              placeholder="bc1qxy…"
              className="font-mono"
              {...register("address")}
            />
            {errors.address ? (
              <p className="text-xs text-destructive">{errors.address.message}</p>
            ) : null}
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          placeholder="Primary BTC hot wallet"
          {...register("label")}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="isActive">Active</Label>
          <p className="text-xs text-muted-foreground">
            Inactive wallets aren&apos;t offered to customers.
          </p>
        </div>
        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create wallet"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/wallets")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
