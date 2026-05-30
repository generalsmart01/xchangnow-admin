import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend";
import {
  clearAuthCookies,
  getRefreshToken,
  setAuthCookies,
  type BackendTokens,
} from "@/lib/auth/session";
import type { AnyEnvelope } from "@/lib/types/envelope";

export const dynamic = "force-dynamic";

function fail(status: number, message: string) {
  return NextResponse.json(
    {
      success: false,
      message,
      data: null,
      error: { code: "UNAUTHORIZED", details: [] },
      meta: { requestId: "n/a", timestamp: new Date().toISOString(), path: "/auth/refresh" },
    },
    { status },
  );
}

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return fail(401, "Invalid refresh token");

  let res: Response;
  try {
    res = await backendFetch("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return fail(502, "Unable to reach the API server");
  }

  const envelope = (await res.json()) as AnyEnvelope<{ tokens: BackendTokens }>;
  if (!envelope.success) {
    await clearAuthCookies();
    return NextResponse.json(envelope, { status: res.status });
  }

  await setAuthCookies(envelope.data.tokens);
  return NextResponse.json(
    {
      success: true,
      message: "Token refreshed",
      data: { ok: true },
      meta: envelope.meta,
    },
    { status: 200 },
  );
}
