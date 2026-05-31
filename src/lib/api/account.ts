import { apiPost } from "./client";

/**
 * Public (unauthenticated) account flows. These go through the generic proxy
 * to the backend's `/api/auth/*` endpoints — no access token is required, so
 * no cookie is attached. None of them log the user in; on success the UI sends
 * the user to /login to sign in.
 */

/** Redeem a staff/user invite by setting an initial password. */
export function acceptInvite(body: { token: string; password: string }) {
  return apiPost<unknown>(`/auth/accept-invite`, body);
}

/** Verify an email address from the token in the verification link. */
export function verifyEmail(token: string) {
  return apiPost<unknown>(`/auth/verify-email`, { token });
}

/** Request a password-reset email. Always succeeds (no account enumeration). */
export function forgotPassword(email: string) {
  return apiPost<unknown>(`/auth/forgot-password`, { email });
}

/** Set a new password using the token from the reset link. */
export function resetPassword(body: { token: string; password: string }) {
  return apiPost<unknown>(`/auth/reset-password`, body);
}

/**
 * Change password while authenticated. Verifies the current password, then
 * swaps in the new one. The backend revokes the user's OTHER sessions but keeps
 * this one — so the caller stays logged in on this device (no re-auth needed).
 */
export function changePassword(body: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiPost<{ message: string }>(`/auth/change-password`, body);
}
