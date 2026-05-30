import { ToneBadge, type Tone } from "@/components/shared/tone-badge";
import type { PayoutStatus } from "@/lib/types/payout";

const MAP: Record<PayoutStatus, { tone: Tone; label: string }> = {
  PENDING: { tone: "warning", label: "Pending" },
  PROCESSING: { tone: "info", label: "Processing" },
  PAID: { tone: "success", label: "Paid" },
  FAILED: { tone: "danger", label: "Failed" },
};

export function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const { tone, label } = MAP[status] ?? { tone: "neutral", label: status };
  return (
    <ToneBadge tone={tone} dot>
      {label}
    </ToneBadge>
  );
}
