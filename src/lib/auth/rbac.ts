import type { Role } from "@/lib/types/user";

/**
 * Capability keys mirror the backend permission matrix. The FE uses these for
 * sidebar visibility + button disabled states ONLY — the backend re-checks
 * every request via its @Roles guard.
 */
export type Capability =
  | "dashboard.view"
  | "users.view"
  | "users.changeStatus"
  | "users.anonymize"
  | "transactions.view"
  | "transactions.review" // approve / reject / mark-completed
  | "payouts.view"
  | "payouts.updateStatus"
  | "rates.view"
  | "rates.manage"
  | "wallets.view"
  | "wallets.manage"
  | "assets.view"
  | "assets.manage"
  | "networks.view"
  | "networks.manage"
  | "kyc.view"
  | "kyc.review"
  | "staff.list"
  | "staff.invite"
  | "staff.changeRole"
  | "audit.view";

const ALL: Role[] = ["SUPER_ADMIN", "ADMIN", "OPS", "CUSTOMER_SERVICE"];

const CAPABILITY_ROLES: Record<Capability, Role[]> = {
  "dashboard.view": ALL,
  "users.view": ["SUPER_ADMIN", "ADMIN", "CUSTOMER_SERVICE"],
  "users.changeStatus": ["SUPER_ADMIN", "ADMIN", "CUSTOMER_SERVICE"],
  "users.anonymize": ["SUPER_ADMIN", "ADMIN"],
  "transactions.view": ALL,
  "transactions.review": ["SUPER_ADMIN", "ADMIN", "OPS"],
  "payouts.view": ALL,
  "payouts.updateStatus": ["SUPER_ADMIN", "ADMIN", "OPS"],
  "rates.view": ALL,
  "rates.manage": ["SUPER_ADMIN", "ADMIN", "OPS"],
  "wallets.view": ["SUPER_ADMIN", "ADMIN", "OPS"],
  "wallets.manage": ["SUPER_ADMIN", "ADMIN", "OPS"],
  "assets.view": ["SUPER_ADMIN", "ADMIN"],
  "assets.manage": ["SUPER_ADMIN", "ADMIN"],
  "networks.view": ["SUPER_ADMIN", "ADMIN"],
  "networks.manage": ["SUPER_ADMIN", "ADMIN"],
  "kyc.view": ["SUPER_ADMIN", "ADMIN", "OPS"],
  "kyc.review": ["SUPER_ADMIN", "ADMIN", "OPS"],
  "staff.list": ["SUPER_ADMIN", "ADMIN"],
  "staff.invite": ["SUPER_ADMIN"],
  "staff.changeRole": ["SUPER_ADMIN"],
  "audit.view": ["SUPER_ADMIN", "ADMIN"],
};

export function can(role: Role | null | undefined, cap: Capability): boolean {
  if (!role) return false;
  return CAPABILITY_ROLES[cap].includes(role);
}

/** CUSTOMER_SERVICE may change status, but only to SUSPEND (read-only otherwise). */
export function isSuspendOnly(role: Role | null | undefined): boolean {
  return role === "CUSTOMER_SERVICE";
}

export function isAdminRole(role: Role | null | undefined): boolean {
  return !!role && ALL.includes(role);
}

/** Capability that gates visibility/access of each top-level admin section. */
export const SECTION_CAPABILITY: { prefix: string; cap: Capability }[] = [
  { prefix: "/admin/users", cap: "users.view" },
  { prefix: "/admin/transactions", cap: "transactions.view" },
  { prefix: "/admin/payouts", cap: "payouts.view" },
  { prefix: "/admin/kyc", cap: "kyc.view" },
  { prefix: "/admin/rates", cap: "rates.view" },
  { prefix: "/admin/wallets", cap: "wallets.view" },
  { prefix: "/admin/assets", cap: "assets.view" },
  { prefix: "/admin/networks", cap: "networks.view" },
  { prefix: "/admin/staff", cap: "staff.list" },
];

/** True if the role may access the given /admin/* pathname. */
export function canAccessRoute(role: Role | null | undefined, pathname: string): boolean {
  if (!isAdminRole(role)) return false;
  const match = SECTION_CAPABILITY.find((s) => pathname.startsWith(s.prefix));
  if (!match) return true; // /admin, /admin/settings — available to all admins
  return can(role, match.cap);
}
