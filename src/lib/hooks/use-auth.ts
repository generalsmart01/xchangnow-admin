"use client";

import { useCurrentUserContext } from "@/lib/auth/current-user-context";
import { can, isSuspendOnly, type Capability } from "@/lib/auth/rbac";

/** Access the authenticated admin + capability helpers bound to their role. */
export function useAuth() {
  const { user, setUser, refetch } = useCurrentUserContext();
  return {
    user,
    role: user.role,
    setUser,
    refetch,
    can: (cap: Capability) => can(user.role, cap),
    isSuspendOnly: isSuspendOnly(user.role),
  };
}
