import type { Role } from "@/lib/types/user";

export type JwtPayload = {
  sub?: string;
  email?: string;
  role?: Role;
  exp?: number;
  iat?: number;
  [k: string]: unknown;
};

/** Base64url -> string, edge/runtime-safe (no Buffer dependency). */
function base64UrlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  if (typeof atob === "function") {
    const binary = atob(base64);
    // Handle UTF-8 multibyte sequences.
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  // Node fallback.
  return Buffer.from(base64, "base64").toString("utf8");
}

/**
 * Decode a JWT payload WITHOUT verifying the signature. The backend is the
 * source of truth for auth; this is only used for cheap FE route gating.
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(base64UrlDecode(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

export function isExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}
