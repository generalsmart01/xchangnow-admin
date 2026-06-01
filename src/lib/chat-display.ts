import { fullName } from "@/lib/format";
import type { Tone } from "@/components/shared/tone-badge";
import type { ChatConversation, ChatParty, ChatStatus } from "@/lib/types/chat";

/** "Michael Adeleke" from a chat party (reads the nested profile). */
export function partyName(party?: ChatParty | null): string {
  if (!party) return "—";
  return fullName(party.profile ?? undefined);
}

const STATUS_TONE: Record<ChatStatus, Tone> = {
  OPEN: "info",
  PENDING_STAFF: "warning",
  RESOLVED: "success",
  CLOSED: "muted",
};

export function chatStatusTone(status: ChatStatus): Tone {
  return STATUS_TONE[status];
}

/**
 * Does the conversation have unread customer activity for staff? True when the
 * last message is newer than the last time staff read it.
 */
export function isStaffUnread(c: ChatConversation): boolean {
  if (!c.lastMessageAt) return false;
  if (!c.staffLastReadAt) return true;
  return new Date(c.staffLastReadAt).getTime() < new Date(c.lastMessageAt).getTime();
}
