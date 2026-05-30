import { ToneBadge, type Tone } from "@/components/shared/tone-badge";
import type { KycStatus } from "@/lib/types/kyc";

const MAP: Record<KycStatus, { tone: Tone; label: string }> = {
  PENDING: { tone: "warning", label: "Pending" },
  APPROVED: { tone: "success", label: "Approved" },
  REJECTED: { tone: "danger", label: "Rejected" },
  NOT_SUBMITTED: { tone: "muted", label: "Not submitted" },
};

export function KycStatusBadge({ status }: { status: KycStatus }) {
  const { tone, label } = MAP[status] ?? { tone: "neutral", label: status };
  return (
    <ToneBadge tone={tone} dot>
      {label}
    </ToneBadge>
  );
}
