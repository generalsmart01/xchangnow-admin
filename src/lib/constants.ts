/**
 * Backend base URL. The Next.js proxy/route handlers talk to this server-side;
 * the browser only ever talks to `/api/*` on this app.
 *
 * Uses the local URL in development and the hosted server URL in production,
 * falling back to whichever is set. Trailing slashes are stripped so the API
 * prefix joins cleanly.
 */
const RAW_BACKEND_URL =
  (process.env.NODE_ENV === "production"
    ? process.env.BACKEND_SERVER_URL
    : process.env.BACKEND_LOCAL_URL) ??
  process.env.BACKEND_SERVER_URL ??
  process.env.BACKEND_LOCAL_URL ??
  "http://localhost:3450";

export const BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, "");

/** Backend API prefix (everything is mounted under /api on the backend). */
export const BACKEND_API_PREFIX = process.env.BACKEND_API_PREFIX ?? "/api";

export const COOKIES = {
  access: "access_token",
  refresh: "refresh_token",
} as const;

/** Cookie max-ages in seconds (mirror backend token lifetimes). */
export const COOKIE_MAX_AGE = {
  access: 15 * 60, // 15m
  refresh: 7 * 24 * 60 * 60, // 7d
} as const;

export const DEFAULT_PAGE_SIZE = 20;

export const APP_NAME = "XchangNow";
export const APP_TAGLINE = "Admin Console";
