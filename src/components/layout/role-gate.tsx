"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { can, type Capability } from "@/lib/auth/rbac";
import type { Role } from "@/lib/types/user";

type RoleGateProps = {
  children: ReactNode;
  /** Allowed explicit roles. */
  roles?: Role[];
  /** OR a capability key (preferred — mirrors the matrix). */
  cap?: Capability;
  fallback?: ReactNode;
};

/**
 * FE affordance only — the backend re-checks every request. Renders children
 * when the current admin satisfies `roles` and/or `cap`.
 */
export function RoleGate({ children, roles, cap, fallback = null }: RoleGateProps) {
  const { role } = useAuth();

  const roleOk = roles ? roles.includes(role) : true;
  const capOk = cap ? can(role, cap) : true;

  return roleOk && capOk ? <>{children}</> : <>{fallback}</>;
}
