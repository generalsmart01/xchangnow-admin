/** "UNDER_REVIEW" -> "Under review", "BUY" -> "Buy" */
export function titleCase(value: string): string {
  const lower = value.replace(/_/g, " ").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Acronyms / asset codes we want to keep upper-cased. */
const KEEP_UPPER = new Set(["BTC", "ETH", "USDT", "USDC", "BVN", "NIN", "KYC", "BSC"]);

export function smartLabel(value: string): string {
  if (KEEP_UPPER.has(value)) return value;
  return titleCase(value);
}
