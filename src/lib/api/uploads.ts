import { ApiError } from "./client";
import type { AnyEnvelope } from "@/lib/types/envelope";

/** Where an uploaded image is destined — drives backend storage/validation. */
export type UploadPurpose =
  | "TRANSACTION_PROOF"
  | "KYC_SELFIE"
  | "CHAT_ATTACHMENT";

export type UploadResult = { url: string };

/** Reasonable client-side guards before hitting the network. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * Upload an image to `POST /uploads/image` (multipart) and return its URL.
 * Goes through the dedicated `/api/uploads/image` route handler so the bearer
 * token is attached server-side. Retries once after a silent token refresh on
 * a 401, matching the JSON client's behavior.
 */
export async function uploadImage(
  file: File,
  purpose: UploadPurpose,
): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large (max 8 MB).");
  }
  if (file.type && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Unsupported file type — use JPG, PNG, WEBP or GIF.");
  }

  const send = () => {
    const form = new FormData();
    form.append("file", file);
    form.append("purpose", purpose);
    return fetch("/api/uploads/image", {
      method: "POST",
      credentials: "include",
      body: form,
    });
  };

  let res = await send();
  if (res.status === 401) {
    const refreshed = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    }).then((r) => r.ok);
    if (refreshed) res = await send();
  }

  const envelope = (await res
    .json()
    .catch(() => null)) as AnyEnvelope<UploadResult> | null;

  if (!envelope) {
    throw new ApiError(
      {
        success: false,
        message: res.statusText || "Upload failed",
        data: null,
        error: { code: "HTTP_" + res.status, details: [] },
        meta: { requestId: "n/a", timestamp: "", path: "/uploads/image" },
      },
      res.status,
    );
  }
  if (!envelope.success) throw new ApiError(envelope, res.status);
  return envelope.data;
}
