import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend";
import { getAccessToken } from "@/lib/auth/session";

/**
 * Generic authenticating proxy for ALL backend API calls.
 * ----------------------------------------------------------------------------
 * This file does NOT re-implement any backend endpoint. It is a single
 * catch-all (`[...path]`) pass-through: the browser calls `/api/proxy/<x>` and
 * this handler forwards it verbatim to the backend's `/api/<x>`. One file
 * covers every route (users, transactions, assets, kyc, …) — there is no
 * per-endpoint handler.
 *
 * WHY THE PROXY EXISTS — httpOnly cookie auth:
 *   On login the access/refresh tokens are stored as `httpOnly` cookies, which
 *   browser JavaScript is intentionally forbidden from reading (so an XSS bug
 *   can't exfiltrate them). That means the browser CANNOT attach the
 *   `Authorization: Bearer <token>` header to a direct backend call — it has no
 *   access to the token. This handler runs server-side, where it CAN read the
 *   cookie, so it injects the bearer token on the way through.
 *
 * REQUEST FLOW:
 *   browser  ──(cookies, no token in JS)──▶  /api/proxy/users/me  (this file)
 *      │  reads httpOnly access_token cookie via getAccessToken()
 *      │  attaches `Authorization: Bearer <token>` (see backendFetch)
 *      ▼
 *   backend  GET {BACKEND_URL}/api/users/me
 *      │  returns the standard response envelope
 *      ▼
 *   this file passes the backend's status + JSON body back UNCHANGED, so the
 *   client wrapper (lib/api/client.ts) sees the real envelope and requestId.
 *
 * NOTES:
 *   - `dynamic = "force-dynamic"`: never statically cache — every call depends
 *     on the per-request cookie and must hit the backend live.
 *   - The query string is preserved; request bodies are forwarded for
 *     non-GET/HEAD verbs.
 *   - 401 handling (silent token refresh + retry) lives in the client wrapper,
 *     not here — this proxy stays a dumb, transparent courier.
 *   - The browser only ever talks to this same-origin `/api/proxy/*`; the real
 *     backend origin (BACKEND_URL) is never exposed to the browser, so no CORS
 *     config is required on the backend.
 */

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { path } = await ctx.params;
  const search = req.nextUrl.search; // includes leading "?" or ""
  // Rebuild the backend path from the catch-all segments, e.g.
  // ["users","me"] + "?x=1"  ->  "/users/me?x=1".
  const targetPath = `/${path.join("/")}${search}`;

  // Read the bearer token from the httpOnly cookie (server-side only).
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
    // The backend was unreachable (down, DNS, timeout). Synthesize an envelope
    // in the SAME shape the backend uses, so the client error handler can treat
    // it uniformly instead of choking on a raw network error.
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

  // Pass the backend response through verbatim — same status code and JSON body
  // (the standard envelope). We deliberately do not parse/reshape it; the client
  // wrapper unwraps `data`/`meta` and surfaces the backend's requestId for support.
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}

// Every HTTP verb routes through the same handler — the backend decides what
// each path/method does; this proxy is method-agnostic.
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
