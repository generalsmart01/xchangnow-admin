import "server-only";
import { BACKEND_API_PREFIX, BACKEND_URL } from "@/lib/constants";

/** Build an absolute backend URL from a path beginning with "/". */
export function backendUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${BACKEND_API_PREFIX}${clean}`;
}

export type BackendFetchInit = RequestInit & { accessToken?: string };

/** Server-side fetch to the backend, optionally attaching a bearer token. */
export async function backendFetch(
  path: string,
  init: BackendFetchInit = {},
): Promise<Response> {
  const { accessToken, headers, ...rest } = init;
  return fetch(backendUrl(path), {
    ...rest,
    // The backend is the source of truth; never cache its responses.
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });
}
