import { ToneBadge, type Tone } from "@/components/shared/tone-badge";
import type { UserStatus } from "@/lib/types/user";

const MAP: Record<UserStatus, { tone: Tone; label: string }> = {
  ACTIVE: { tone: "success", label: "Active" },
  SUSPENDED: { tone: "danger", label: "Suspended" },
  PENDING_VERIFICATION: { tone: "warning", label: "Pending verification" },
  ANONYMIZED: { tone: "muted", label: "Anonymized" },
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const { tone, label } = MAP[status] ?? { tone: "neutral", label: status };
  return (
    <ToneBadge tone={tone} dot>
      {label}
    </ToneBadge>
  );
}
