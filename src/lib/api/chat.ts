import { apiGet, apiPatch, apiPost, qs } from "./client";
import type {
  ChatConversation,
  ChatMessage,
  ChatStatus,
  ConversationsListResponse,
  MessagesResponse,
  SendMessageBody,
} from "@/lib/types/chat";

const BASE = "/admin/chat/conversations";

export type ListConversationsParams = {
  page?: number;
  pageSize?: number;
  status?: ChatStatus | "";
  /** "me" (my claimed) or "unassigned" (claim-needed pool). */
  assignedTo?: "me" | "unassigned" | "";
};

export function listConversations(params: ListConversationsParams = {}) {
  return apiGet<ConversationsListResponse>(`${BASE}${qs(params)}`);
}

export function getConversation(id: string) {
  return apiGet<ChatConversation>(`${BASE}/${id}`);
}

export type ListMessagesParams = {
  pageSize?: number;
  /** ISO cursor — fetch messages older than this. */
  before?: string;
};

export function listMessages(id: string, params: ListMessagesParams = {}) {
  return apiGet<MessagesResponse>(`${BASE}/${id}/messages${qs(params)}`);
}

export function sendMessage(id: string, body: SendMessageBody) {
  return apiPost<ChatMessage>(`${BASE}/${id}/messages`, body);
}

/** Claim the conversation (assignedStaffId = caller). */
export function assignConversation(id: string) {
  return apiPatch<ChatConversation>(`${BASE}/${id}/assign`);
}

export function resolveConversation(id: string) {
  return apiPatch<ChatConversation>(`${BASE}/${id}/resolve`);
}

export function closeConversation(id: string) {
  return apiPatch<ChatConversation>(`${BASE}/${id}/close`);
}

/** Mark read up to now (staffLastReadAt = now). */
export function markConversationRead(id: string) {
  return apiPatch<ChatConversation>(`${BASE}/${id}/read`);
}
