import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend";
import { clearAuthCookies, getAccessToken } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const accessToken = await getAccessToken();

  // Best-effort backend logout; clear cookies regardless of the outcome.
  try {
    await backendFetch("/auth/logout", { method: "POST", accessToken });
  } catch {
    // ignore — local cookie clear below is what matters for the browser
  }

  await clearAuthCookies();

  return NextResponse.json(
    {
      success: true,
      message: "Logged out",
      data: { ok: true },
      meta: { requestId: "n/a", timestamp: new Date().toISOString(), path: "/auth/logout" },
    },
    { status: 200 },
  );
}
