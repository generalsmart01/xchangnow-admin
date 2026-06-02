/**
 * True if the value looks like a remote image URL (http/https) — e.g. a
 * Cloudinary URL. Hashes / plain text return false, so callers can decide
 * whether to render an <img> or show the raw value.
 */
export function isImageUrl(value: string | null | undefined): value is string {
  return !!value && /^https?:\/\//i.test(value);
}
