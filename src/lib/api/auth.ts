import type { AnyEnvelope } from "@/lib/types/envelope";
import type { SelfUser } from "@/lib/types/user";
import { ApiError } from "./client";

export type LoginResult = { user: SelfUser };

async function postAuth<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/auth/${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const envelope = (await res.json().catch(() => null)) as AnyEnvelope<T> | null;
  if (!envelope) {
    throw new ApiError(
      {
        success: false,
        message: res.statusText || "Request failed",
        data: null,
        error: { code: "HTTP_" + res.status, details: [] },
        meta: { requestId: "n/a", timestamp: "", path },
      },
      res.status,
    );
  }
  if (!envelope.success) {
    throw new ApiError(envelope, res.status);
  }
  return envelope.data;
}

export function login(email: string, password: string) {
  return postAuth<LoginResult>("login", { email, password });
}

export function logout() {
  return postAuth<{ ok: true }>("logout");
}

export function refresh() {
  return postAuth<{ ok: true }>("refresh");
}
