"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/lib/api/notifications";

/**
 * Headless: reflects the unread notification count in the browser tab title,
 * e.g. "(3) Users · XchangNow". Re-applies on route change (Next resets the
 * title per page) and whenever the count changes. Shares the unread-count query
 * cache with the notification bell, so it adds no extra polling.
 */
export function NotificationTitleSync() {
  const pathname = usePathname();

  const { data: count = 0 } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    // Strip any existing "(n) " prefix so we don't stack it.
    const base = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = count > 0 ? `(${count}) ${base}` : base;
  }, [count, pathname]);

  return null;
}
