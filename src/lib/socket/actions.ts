"use server";

import { getAccessToken } from "@/lib/auth/session";
import { BACKEND_URL } from "@/lib/constants";

export type SocketAuth = {
  /** Short-lived access token for the Socket.IO handshake. */
  token: string;
  /** Socket.IO server origin. */
  url: string;
};

/**
 * Returns the credentials the browser needs to open the chat WebSocket.
 *
 * The access token lives in an httpOnly cookie that browser JS can't read, so
 * this Server Action reads it server-side and hands it back for the Socket.IO
 * `auth: { token }` handshake. Only the short-lived (15m) ACCESS token is
 * exposed — the refresh token stays httpOnly. The client re-calls this on
 * (re)connect to pick up a freshly-refreshed token.
 *
 * `url` defaults to the backend origin; override with WS_URL if the realtime
 * gateway is hosted elsewhere.
 */
export async function getSocketAuthAction(): Promise<SocketAuth | null> {
  const token = await getAccessToken();
  if (!token) return null;
  return {
    token,
    url: process.env.WS_URL ?? BACKEND_URL,
  };
}
