import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/lib/server/backend";
import { getAccessToken } from "@/lib/auth/session";

/**
 * Dedicated multipart upload proxy for `POST /uploads/image`.
 *
 * The generic `/api/proxy` reads the body as text and forces an
 * `application/json` content-type, which corrupts binary/multipart uploads.
 * This handler instead forwards the parsed FormData verbatim — `fetch` re-sets
 * the multipart boundary automatically — and attaches the bearer token read
 * from the httpOnly cookie (same auth model as the proxy).
 *
 * Returns the backend envelope ({ data: { url } }) unchanged.
 */
export const dynamic = "force-dynamic";

function envelope(message: string, code: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
      data: null,
      error: { code, details: [] },
      meta: {
        requestId: "n/a",
        timestamp: new Date().toISOString(),
        path: "/uploads/image",
      },
    },
    { status },
  );
}

export async function POST(req: NextRequest) {
  const accessToken = await getAccessToken();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return envelope("Expected a multipart form upload", "BAD_REQUEST", 400);
  }

  let res: Response;
  try {
    res = await fetch(backendUrl("/uploads/image"), {
      method: "POST",
      // Do NOT set Content-Type — fetch derives the multipart boundary from the
      // FormData body itself.
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: form,
      cache: "no-store",
    });
  } catch {
    return envelope("Unable to reach the API server", "UPSTREAM_UNAVAILABLE", 502);
  }

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}
