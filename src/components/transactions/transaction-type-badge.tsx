import { ToneBadge, type Tone } from "@/components/shared/tone-badge";
import type { TransactionType } from "@/lib/types/transaction";

const MAP: Record<TransactionType, { tone: Tone; label: string }> = {
  BUY: { tone: "info", label: "Buy" },
  SELL: { tone: "brand", label: "Sell" },
  SWAP: { tone: "warning", label: "Swap" },
};

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const { tone, label } = MAP[type] ?? { tone: "neutral", label: type };
  return <ToneBadge tone={tone}>{label}</ToneBadge>;
}
