import {
  LayoutDashboard,
  ArrowLeftRight,
  Banknote,
  Users,
  IdCard,
  LineChart,
  Wallet,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Capability } from "@/lib/auth/rbac";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Capability required to see this item (undefined = all admins). */
  cap?: Capability;
  /** Match exactly (for the dashboard root) instead of by prefix. */
  exact?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Transactions", href: "/admin/transactions", icon: ArrowLeftRight, cap: "transactions.view" },
  { label: "Payouts", href: "/admin/payouts", icon: Banknote, cap: "payouts.view" },
  { label: "Users", href: "/admin/users", icon: Users, cap: "users.view" },
  { label: "KYC", href: "/admin/kyc", icon: IdCard, cap: "kyc.view" },
  { label: "Rates", href: "/admin/rates", icon: LineChart, cap: "rates.view" },
  { label: "Wallets", href: "/admin/wallets", icon: Wallet, cap: "wallets.view" },
  { label: "Staff", href: "/admin/staff", icon: UserCog, cap: "staff.list" },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
