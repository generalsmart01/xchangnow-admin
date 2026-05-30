import type { Network } from "@/lib/types/transaction";

const TX_EXPLORERS: Record<Network, (hash: string) => string> = {
  BITCOIN: (h) => `https://blockstream.info/tx/${h}`,
  ETHEREUM: (h) => `https://etherscan.io/tx/${h}`,
  TRON: (h) => `https://tronscan.org/#/transaction/${h}`,
  BSC: (h) => `https://bscscan.com/tx/${h}`,
  POLYGON: (h) => `https://polygonscan.com/tx/${h}`,
};

const EXPLORER_NAMES: Record<Network, string> = {
  BITCOIN: "Blockstream",
  ETHEREUM: "Etherscan",
  TRON: "Tronscan",
  BSC: "BscScan",
  POLYGON: "PolygonScan",
};

export function explorerTxUrl(network: Network, hash: string): string | null {
  const fn = TX_EXPLORERS[network];
  return fn ? fn(hash) : null;
}

export function explorerName(network: Network): string {
  return EXPLORER_NAMES[network] ?? "block explorer";
}
