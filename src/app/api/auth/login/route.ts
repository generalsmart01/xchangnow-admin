import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend";
import { setAuthCookies, type BackendTokens } from "@/lib/auth/session";
import type { AnyEnvelope } from "@/lib/types/envelope";
import type { SelfUser } from "@/lib/types/user";

export const dynamic = "force-dynamic";

type LoginData = { user: SelfUser; tokens: BackendTokens };

export async function POST(req: NextRequest) {
  const body = await req.text();

  let res: Response;
  try {
    res = await backendFetch("/auth/login", { method: "POST", body });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to reach the API server",
        data: null,
        error: { code: "UPSTREAM_UNAVAILABLE", details: [] },
        meta: { requestId: "n/a", timestamp: new Date().toISOString(), path: "/auth/login" },
      },
      { status: 502 },
    );
  }

  const envelope = (await res.json()) as AnyEnvelope<LoginData>;

  // Forward backend errors (wrong password, unverified, suspended, rate-limit) as-is.
  if (!envelope.success) {
    return NextResponse.json(envelope, { status: res.status });
  }

  const { user, tokens } = envelope.data;
  await setAuthCookies(tokens);

  // Strip tokens before returning to the browser — they live only in cookies.
  return NextResponse.json(
    {
      success: true,
      message: envelope.message,
      data: { user },
      meta: envelope.meta,
    },
    { status: 200 },
  );
}
