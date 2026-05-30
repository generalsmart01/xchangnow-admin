"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { SelfUser } from "@/lib/types/user";
import { getMe } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { isAdminRole } from "@/lib/auth/rbac";
import { Loader2 } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

type CurrentUserContextValue = {
  user: SelfUser;
  setUser: (u: SelfUser) => void;
  refetch: () => Promise<void>;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

/**
 * Loads the authenticated admin via /users/me (which silently refreshes the
 * access token if needed). Renders a splash while loading and bounces
 * non-admins / unauthenticated visitors to /login.
 */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SelfUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "denied">(
    "loading",
  );

  const load = useCallback(async () => {
    try {
      const { data } = await getMe();
      if (!isAdminRole(data.role)) {
        setStatus("denied");
        router.replace("/login");
        return;
      }
      setUser(data);
      setStatus("ready");
    } catch (err) {
      setStatus("denied");
      if (err instanceof ApiError && err.status === 403) {
        router.replace("/login");
      } else {
        router.replace("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    // Fetch the current admin once on mount (and on explicit refetch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (status !== "ready" || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
            X
          </span>
          {APP_NAME}
        </div>
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <CurrentUserContext.Provider value={{ user, setUser, refetch: load }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUserContext() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUserContext must be used within CurrentUserProvider");
  }
  return ctx;
}
