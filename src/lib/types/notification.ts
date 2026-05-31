/**
 * Admin-facing notifications. The backend exposes the same `/notifications/me`
 * endpoints as users; these are the staff-targeted event types.
 *
 * NOTE: the exact wire shape lives in the USER API reference. The api layer
 * normalizes the common field-name variants (isRead/read, payload/data,
 * count/unreadCount) into this canonical shape, so adjust the mapper in
 * lib/api/notifications.ts if your backend differs.
 */
export const ADMIN_NOTIFICATION_TYPES = [
  "transaction.proof_uploaded",
  "kyc.submitted",
  "system.coingecko_failed",
  "bootstrap.attempted",
] as const;
export type AdminNotificationType =
  | (typeof ADMIN_NOTIFICATION_TYPES)[number]
  | (string & {});

export type AdminNotification = {
  id: string;
  type: AdminNotificationType;
  title: string | null;
  body: string | null;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsListResponse = {
  notifications: AdminNotification[];
  total: number;
  page: number;
  pageSize: number;
  unreadCount?: number;
};
