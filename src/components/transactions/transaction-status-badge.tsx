import { ToneBadge, type Tone } from "@/components/shared/tone-badge";
import type { TransactionStatus } from "@/lib/types/transaction";

const MAP: Record<TransactionStatus, { tone: Tone; label: string }> = {
  PENDING: { tone: "warning", label: "Pending" },
  AWAITING_PAYMENT: { tone: "warning", label: "Awaiting payment" },
  UNDER_REVIEW: { tone: "info", label: "Under review" },
  APPROVED: { tone: "brand", label: "Approved" },
  COMPLETED: { tone: "success", label: "Completed" },
  REJECTED: { tone: "danger", label: "Rejected" },
  EXPIRED: { tone: "muted", label: "Expired" },
  CANCELLED: { tone: "muted", label: "Cancelled" },
};

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const { tone, label } = MAP[status] ?? { tone: "neutral", label: status };
  return (
    <ToneBadge tone={tone} dot>
      {label}
    </ToneBadge>
  );
}
