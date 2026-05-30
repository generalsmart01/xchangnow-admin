import { ToneBadge, type Tone } from "@/components/shared/tone-badge";
import type { Role } from "@/lib/types/user";

const MAP: Record<Role, { tone: Tone; label: string }> = {
  SUPER_ADMIN: { tone: "brand", label: "Super Admin" },
  ADMIN: { tone: "info", label: "Admin" },
  OPS: { tone: "warning", label: "Ops" },
  CUSTOMER_SERVICE: { tone: "neutral", label: "Customer Service" },
  USER: { tone: "muted", label: "User" },
};

export function RoleBadge({ role }: { role: Role }) {
  const { tone, label } = MAP[role] ?? { tone: "neutral", label: role };
  return <ToneBadge tone={tone}>{label}</ToneBadge>;
}
