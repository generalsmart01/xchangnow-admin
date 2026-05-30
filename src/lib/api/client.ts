import type {
  AnyEnvelope,
  ErrorEnvelope,
  Meta,
  ResponseEnvelope,
} from "@/lib/types/envelope";

export class ApiError extends Error {
  readonly code: string;
  readonly details: string[];
  readonly status: number;
  readonly meta: Meta | null;

  constructor(envelope: ErrorEnvelope, status: number) {
    super(envelope.message || "Request failed");
    this.name = "ApiError";
    this.code = envelope.error?.code ?? "UNKNOWN";
    this.details = envelope.error?.details ?? [];
    this.status = status;
    this.meta = envelope.meta ?? null;
  }

  get requestId(): string | undefined {
    return this.meta?.requestId;
  }
}

/** Messages that justify a single silent token refresh + retry. */
const REFRESHABLE_MESSAGES = [
  "Session is no longer valid",
  "Invalid refresh token",
  "jwt expired",
  "Unauthorized",
];

async function parseEnvelope<T>(
  res: Response,
): Promise<AnyEnvelope<T>> {
  try {
    return (await res.json()) as AnyEnvelope<T>;
  } catch {
    // Non-JSON / empty body — synthesize an error envelope.
    return {
      success: false,
      message: res.statusText || "Unexpected server response",
      data: null,
      error: { code: res.ok ? "EMPTY" : "HTTP_" + res.status, details: [] },
      meta: {
        requestId: "n/a",
        timestamp: new Date().toISOString(),
        path: res.url,
      },
    } satisfies ErrorEnvelope;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function trySilentRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export type ApiResult<T> = {
  data: T;
  meta: Meta;
  message: string;
};

async function rawFetch<T>(
  path: string,
  opts: RequestInit,
): Promise<{ res: Response; envelope: AnyEnvelope<T> }> {
  const res = await fetch(`/api/proxy${path}`, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...opts.headers,
    },
  });
  const envelope = await parseEnvelope<T>(res);
  return { res, envelope };
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit = {},
): Promise<ApiResult<T>> {
  let { res, envelope } = await rawFetch<T>(path, opts);

  if (
    res.status === 401 &&
    !envelope.success &&
    REFRESHABLE_MESSAGES.some((m) => envelope.message?.includes(m))
  ) {
    const refreshed = await trySilentRefresh();
    if (refreshed) {
      ({ res, envelope } = await rawFetch<T>(path, opts));
    }
  }

  if (!envelope.success) {
    throw new ApiError(envelope, res.status);
  }

  const ok = envelope as ResponseEnvelope<T>;
  return { data: ok.data, meta: ok.meta, message: ok.message };
}

// Convenience verbs --------------------------------------------------------

export function apiGet<T>(path: string) {
  return apiFetch<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown) {
  return apiFetch<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiPatch<T>(path: string, body?: unknown) {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiDelete<T>(path: string) {
  return apiFetch<T>(path, { method: "DELETE" });
}

/** Build a query string from a record, skipping null/undefined/"" values. */
export function qs(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}
