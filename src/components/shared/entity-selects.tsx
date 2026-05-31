"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listAssets } from "@/lib/api/assets";
import { listNetworks } from "@/lib/api/networks";
import { cn } from "@/lib/utils";

const PAGE = { pageSize: 100 };

/** Cached query for the full asset catalogue (assets include their pairs). */
export function useAssetsCatalogue() {
  return useQuery({
    queryKey: ["assets", "catalogue"],
    queryFn: () => listAssets(PAGE).then((r) => r.data.assets),
    staleTime: 60_000,
  });
}

export function useNetworksCatalogue() {
  return useQuery({
    queryKey: ["networks", "catalogue"],
    queryFn: () => listNetworks(PAGE).then((r) => r.data.networks),
    staleTime: 60_000,
  });
}

type Base = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Only include enabled rows (default true). */
  enabledOnly?: boolean;
};

/** Select an asset by id. */
export function AssetSelect({
  value,
  onChange,
  placeholder = "Select asset",
  className,
  enabledOnly = true,
}: Base) {
  const { data: assets = [] } = useAssetsCatalogue();
  const options = enabledOnly ? assets.filter((a) => a.isEnabled) : assets;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn(className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            {a.symbol} — {a.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Select a network by id. */
export function NetworkSelect({
  value,
  onChange,
  placeholder = "Select network",
  className,
  enabledOnly = true,
}: Base) {
  const { data: networks = [] } = useNetworksCatalogue();
  const options = enabledOnly ? networks.filter((n) => n.isEnabled) : networks;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn(className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((n) => (
          <SelectItem key={n.id} value={n.id}>
            {n.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Select an asset-network pair by its id. Flattens every asset's pairs into
 * "SYMBOL · Network" options.
 */
export function AssetNetworkSelect({
  value,
  onChange,
  placeholder = "Select asset / network",
  className,
  enabledOnly = true,
}: Base) {
  const { data: assets = [] } = useAssetsCatalogue();

  const options = assets.flatMap((a) =>
    (a.networks ?? [])
      .filter((p) => (enabledOnly ? p.isEnabled && a.isEnabled : true))
      .map((p) => ({
        id: p.id,
        label: `${a.symbol} · ${p.network?.name ?? p.network?.code ?? p.networkId}`,
      })),
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn(className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No asset-network pairs available
          </div>
        ) : (
          options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
