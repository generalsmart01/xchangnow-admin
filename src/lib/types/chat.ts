export const CHAT_STATUSES = [
  "OPEN",
  "PENDING_STAFF",
  "RESOLVED",
  "CLOSED",
] as const;
export type ChatStatus = (typeof CHAT_STATUSES)[number];

export const CHAT_SENDER_ROLES = ["USER", "STAFF"] as const;
export type ChatSenderRole = (typeof CHAT_SENDER_ROLES)[number];

/** A conversation participant (customer or staff) with nested profile. */
export type ChatParty = {
  id: string;
  email: string;
  profile?: { firstName?: string | null; lastName?: string | null } | null;
};

export type ChatConversation = {
  id: string;
  userId: string;
  status: ChatStatus;
  subject: string | null;
  assignedStaffId: string | null;
  lastMessageAt: string | null;
  userLastReadAt: string | null;
  staffLastReadAt: string | null;
  createdAt: string;
  closedAt: string | null;
  user?: ChatParty;
  assignedStaff?: ChatParty | null;
};

export type ConversationsListResponse = {
  conversations: ChatConversation[];
  total: number;
  page: number;
  pageSize: number;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: ChatSenderRole;
  body: string | null;
  attachmentUrl: string | null;
  createdAt: string;
};

/** Cursor-paginated, newest-first. */
export type MessagesResponse = {
  messages: ChatMessage[];
  hasMore: boolean;
};

/** Either body or attachmentUrl is required. */
export type SendMessageBody = {
  body?: string;
  attachmentUrl?: string;
};
