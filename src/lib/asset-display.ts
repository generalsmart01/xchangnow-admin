import type { EmbeddedAssetNetwork } from "@/lib/types/asset-network";
import type { EmbeddedAsset } from "@/lib/types/asset";
import type { EmbeddedNetwork } from "@/lib/types/network";

/** "USDT" — the asset symbol from an embedded asset-network. */
export function assetSymbol(an?: EmbeddedAssetNetwork | null): string {
  return an?.asset?.symbol ?? "—";
}

/** "Ethereum" — the network name from an embedded asset-network. */
export function networkName(an?: EmbeddedAssetNetwork | null): string {
  return an?.network?.name ?? an?.network?.code ?? "—";
}

/** "USDT · Ethereum" — a one-line label for an asset-network pair. */
export function pairLabel(an?: EmbeddedAssetNetwork | null): string {
  if (!an) return "—";
  return `${assetSymbol(an)} · ${networkName(an)}`;
}

/** Same, from loose asset + network shapes. */
export function pairLabelFrom(
  asset?: EmbeddedAsset | null,
  network?: EmbeddedNetwork | null,
): string {
  const sym = asset?.symbol ?? "—";
  const net = network?.name ?? network?.code ?? "—";
  return `${sym} · ${net}`;
}
