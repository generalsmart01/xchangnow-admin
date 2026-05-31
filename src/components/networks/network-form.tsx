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
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { createNetwork, updateNetwork } from "@/lib/api/networks";
import type {
  CreateNetworkBody,
  NetworkEntity,
  UpdateNetworkBody,
} from "@/lib/types/network";

const schema = z.object({
  code: z
    .string()
    .regex(/^[A-Z0-9_]{2,20}$/, "2–20 chars: uppercase letters, digits, underscores"),
  name: z.string().min(1, "Required"),
  chainId: z.string().optional(),
  explorerUrlTemplate: z.string().optional(),
  nativeAssetSymbol: z.string().optional(),
  sortOrder: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function NetworkForm({ network }: { network?: NetworkEntity }) {
  const router = useRouter();
  const isEdit = !!network;
  const [isEnabled, setIsEnabled] = useState(network?.isEnabled ?? true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: network?.code ?? "",
      name: network?.name ?? "",
      chainId: network?.chainId != null ? String(network.chainId) : "",
      explorerUrlTemplate: network?.explorerUrlTemplate ?? "",
      nativeAssetSymbol: network?.nativeAssetSymbol ?? "",
      sortOrder: network?.sortOrder != null ? String(network.sortOrder) : "",
    },
  });

  const createMutation = useMutationToast<NetworkEntity, CreateNetworkBody>(
    (body) => createNetwork(body).then((r) => r.data),
    {
      successMessage: "Network created",
      invalidate: [["networks"]],
      onSuccess: () => router.push("/admin/networks"),
    },
  );

  const updateMutation = useMutationToast<NetworkEntity, UpdateNetworkBody>(
    (body) => updateNetwork(network!.id, body).then((r) => r.data),
    {
      successMessage: "Network updated",
      invalidate: [["networks"], ["network", network?.id ?? ""]],
      onSuccess: () => router.push("/admin/networks"),
    },
  );

  const pending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: FormValues) {
    const chainId =
      values.chainId?.trim() ? Number(values.chainId) : null;
    const sortOrder =
      values.sortOrder?.trim() ? Number(values.sortOrder) : undefined;
    const shared = {
      name: values.name.trim(),
      chainId: Number.isNaN(chainId as number) ? null : chainId,
      explorerUrlTemplate: values.explorerUrlTemplate?.trim() || null,
      nativeAssetSymbol: values.nativeAssetSymbol?.trim() || null,
      isEnabled,
      sortOrder,
    };

    if (isEdit) {
      updateMutation.mutate(shared);
    } else {
      createMutation.mutate({ code: values.code.trim(), ...shared });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            placeholder="ARBITRUM"
            className="font-mono uppercase"
            disabled={isEdit}
            {...register("code")}
          />
          {isEdit ? (
            <p className="text-xs text-muted-foreground">Code is immutable.</p>
          ) : errors.code ? (
            <p className="text-xs text-destructive">{errors.code.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Arbitrum One" {...register("name")} />
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="chainId">Chain ID</Label>
          <Input
            id="chainId"
            inputMode="numeric"
            placeholder="42161 (EVM only)"
            {...register("chainId")}
          />
          <p className="text-xs text-muted-foreground">Leave blank for non-EVM.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nativeAssetSymbol">Native asset</Label>
          <Input
            id="nativeAssetSymbol"
            placeholder="ETH"
            className="font-mono"
            {...register("nativeAssetSymbol")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="explorerUrlTemplate">Explorer URL template</Label>
        <Input
          id="explorerUrlTemplate"
          placeholder="https://arbiscan.io/tx/{txHash}"
          className="font-mono text-xs"
          {...register("explorerUrlTemplate")}
        />
        <p className="text-xs text-muted-foreground">
          Use <code>{"{txHash}"}</code> as the placeholder.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input
          id="sortOrder"
          inputMode="numeric"
          placeholder="70"
          className="max-w-[120px]"
          {...register("sortOrder")}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="isEnabled">Enabled</Label>
          <p className="text-xs text-muted-foreground">
            Disabled networks are hidden from customers.
          </p>
        </div>
        <Switch id="isEnabled" checked={isEnabled} onCheckedChange={setIsEnabled} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create network"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/networks")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
