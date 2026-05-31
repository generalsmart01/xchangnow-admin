/**
 * Transaction explorer links. Networks may carry an `explorerUrlTemplate`
 * (e.g. "https://etherscan.io/tx/{txHash}"); when absent we fall back to a
 * small map keyed by the network `code`.
 */
const FALLBACK: Record<string, { url: (hash: string) => string; name: string }> = {
  BITCOIN: { url: (h) => `https://blockstream.info/tx/${h}`, name: "Blockstream" },
  ETHEREUM: { url: (h) => `https://etherscan.io/tx/${h}`, name: "Etherscan" },
  TRON: { url: (h) => `https://tronscan.org/#/transaction/${h}`, name: "Tronscan" },
  BSC: { url: (h) => `https://bscscan.com/tx/${h}`, name: "BscScan" },
  POLYGON: { url: (h) => `https://polygonscan.com/tx/${h}`, name: "PolygonScan" },
  ARBITRUM: { url: (h) => `https://arbiscan.io/tx/${h}`, name: "Arbiscan" },
  SOLANA: { url: (h) => `https://solscan.io/tx/${h}`, name: "Solscan" },
};

export type ExplorerSource = {
  code?: string | null;
  template?: string | null;
  hash: string;
};

export function explorerTxUrl({ code, template, hash }: ExplorerSource): string | null {
  if (!hash) return null;
  if (template) return template.replace("{txHash}", hash);
  if (code && FALLBACK[code]) return FALLBACK[code].url(hash);
  return null;
}

export function explorerName(code?: string | null): string {
  return (code && FALLBACK[code]?.name) || "block explorer";
}
