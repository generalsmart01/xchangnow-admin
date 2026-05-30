import Decimal from "decimal.js";
import {
  format,
  formatDistanceToNowStrict,
  parseISO,
  isValid,
} from "date-fns";

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

/**
 * Format a decimal-string amount for display.
 * Amounts arrive as strings ("290000.00") to preserve precision.
 */
export function money(
  amount: string | number | null | undefined,
  currency = "NGN",
): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  let value: Decimal;
  try {
    value = new Decimal(amount);
  } catch {
    return String(amount);
  }
  const symbol = CURRENCY_SYMBOLS[currency] ?? "";
  const formatted = value.toNumber().toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return symbol ? `${symbol}${formatted}` : `${formatted} ${currency}`;
}

/** Crypto amounts: keep up to 8 dp, trim trailing zeros. */
export function crypto(
  amount: string | number | null | undefined,
  asset?: string,
): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  let value: Decimal;
  try {
    value = new Decimal(amount);
  } catch {
    return String(amount);
  }
  const trimmed = value.toFixed(8).replace(/\.?0+$/, "");
  return asset ? `${trimmed} ${asset}` : trimmed;
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = typeof value === "string" ? parseISO(value) : value;
  return isValid(d) ? d : null;
}

/** Relative time e.g. "3 hours ago". */
export function relativeTime(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return "—";
  return `${formatDistanceToNowStrict(d)} ago`;
}

/** Absolute, e.g. "2026-05-28 14:30 WAT". */
export function absoluteTime(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return "—";
  return `${format(d, "yyyy-MM-dd HH:mm")} WAT`;
}

export function shortDate(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return "—";
  return format(d, "dd MMM yyyy");
}

/** Truncate long IDs / addresses / hashes for table cells. */
export function truncateMiddle(value: string, head = 6, tail = 4): string {
  if (!value) return "—";
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function fullName(
  p: { firstName?: string | null; lastName?: string | null } | null | undefined,
): string {
  if (!p) return "—";
  const name = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
  return name || "—";
}

export function initials(
  p: { firstName?: string | null; lastName?: string | null } | null | undefined,
): string {
  if (!p) return "?";
  const a = p.firstName?.[0] ?? "";
  const b = p.lastName?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}
