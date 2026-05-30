import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend";
import { getAccessToken } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { path } = await ctx.params;
  const search = req.nextUrl.search; // includes leading "?" or ""
  const targetPath = `/${path.join("/")}${search}`;

  const accessToken = await getAccessToken();

  // Forward the request body for non-GET/HEAD verbs.
  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
    if (body === "") body = undefined;
  }

  let res: Response;
  try {
    res = await backendFetch(targetPath, {
      method: req.method,
      accessToken,
      body,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to reach the API server",
        data: null,
        error: { code: "UPSTREAM_UNAVAILABLE", details: [] },
        meta: {
          requestId: "n/a",
          timestamp: new Date().toISOString(),
          path: targetPath,
        },
      },
      { status: 502 },
    );
  }

  // Pass the backend envelope through verbatim (status + JSON).
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
