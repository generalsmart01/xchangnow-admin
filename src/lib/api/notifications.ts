import { apiGet, apiPatch, qs } from "./client";
import type {
  AdminNotification,
  NotificationsListResponse,
} from "@/lib/types/notification";

/**
 * Loose wire shape — the backend may use any of these field-name variants.
 * `normalize()` collapses them into the canonical AdminNotification.
 */
type RawNotification = {
  id: string;
  type: string;
  title?: string | null;
  body?: string | null;
  message?: string | null;
  payload?: Record<string, unknown> | null;
  data?: Record<string, unknown> | null;
  isRead?: boolean;
  read?: boolean;
  readAt?: string | null;
  createdAt?: string;
  created_at?: string;
};

type RawList = {
  notifications?: RawNotification[];
  items?: RawNotification[];
  data?: RawNotification[];
  total?: number;
  page?: number;
  pageSize?: number;
  unreadCount?: number;
};

function normalize(n: RawNotification): AdminNotification {
  return {
    id: n.id,
    type: n.type,
    title: n.title ?? null,
    body: n.body ?? n.message ?? null,
    payload: n.payload ?? n.data ?? null,
    isRead: n.isRead ?? n.read ?? false,
    readAt: n.readAt ?? null,
    createdAt: n.createdAt ?? n.created_at ?? "",
  };
}

export type ListNotificationsParams = {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
};

export async function listNotifications(
  params: ListNotificationsParams = {},
): Promise<NotificationsListResponse> {
  const { data } = await apiGet<RawList>(`/notifications/me${qs(params)}`);
  const raw = data.notifications ?? data.items ?? data.data ?? [];
  return {
    notifications: raw.map(normalize),
    total: data.total ?? raw.length,
    page: data.page ?? params.page ?? 1,
    pageSize: data.pageSize ?? params.pageSize ?? raw.length,
    unreadCount: data.unreadCount,
  };
}

/** Returns just the unread count, tolerating {count} | {unreadCount} | number. */
export async function getUnreadCount(): Promise<number> {
  const { data } = await apiGet<
    { count?: number; unreadCount?: number } | number
  >(`/notifications/me/unread-count`);
  if (typeof data === "number") return data;
  return data?.count ?? data?.unreadCount ?? 0;
}

export function markNotificationRead(id: string) {
  return apiPatch<unknown>(`/notifications/me/${id}/read`);
}

export function markAllNotificationsRead() {
  return apiPatch<unknown>(`/notifications/me/read-all`);
}
