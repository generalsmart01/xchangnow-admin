import { ToneBadge } from "@/components/shared/tone-badge";
import { chatStatusTone } from "@/lib/chat-display";
import { smartLabel } from "@/lib/labels";
import type { ChatStatus } from "@/lib/types/chat";

export function ConversationStatusBadge({ status }: { status: ChatStatus }) {
  return (
    <ToneBadge tone={chatStatusTone(status)} dot>
      {smartLabel(status)}
    </ToneBadge>
  );
}
