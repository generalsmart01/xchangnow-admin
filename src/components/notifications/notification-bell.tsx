"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell, CheckCheck, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { absoluteTime } from "@/lib/format";
import { notificationMeta } from "@/lib/notifications";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import { isChimeMuted, setChimeMuted } from "@/lib/sound";
import type { AdminNotification } from "@/lib/types/notification";

const ICON_TONE: Record<string, string> = {
  info: "bg-info/10 text-info",
  brand: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-warning-foreground",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-foreground/5 text-foreground",
  success: "bg-success/12 text-success",
  muted: "bg-muted text-muted-foreground",
};

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  // Read the persisted sound preference on mount (localStorage is client-only;
  // deferring to an effect avoids a hydration mismatch on the icon).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMuted(isChimeMuted()), []);

  function toggleMuted() {
    const next = !muted;
    setChimeMuted(next);
    setMuted(next);
  }

  // Poll the unread count even while the dropdown is closed. Don't retry or
  // refetch-on-focus: if the endpoint is failing, one request per interval is
  // plenty — retries + focus refetches turn a backend 500 into a request storm.
  const unread = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Only fetch the list when the dropdown is open.
  const list = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => listNotifications({ pageSize: 8 }),
    enabled: open,
    retry: false,
  });

  const markRead = useMutationToast<unknown, string>(
    (id) => markNotificationRead(id),
    { invalidate: [["notifications"]] },
  );

  const markAll = useMutationToast<unknown, void>(
    () => markAllNotificationsRead(),
    { successMessage: "All notifications marked read", invalidate: [["notifications"]] },
  );

  const count = unread.data ?? 0;
  const items = list.data?.notifications ?? [];

  function onItemClick(n: AdminNotification) {
    if (!n.isRead) markRead.mutate(n.id);
    const { href } = notificationMeta(n);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${count ? ` (${count} unread)` : ""}`}
        >
          <Bell className="size-5" />
          {count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground">
              {count > 9 ? "9+" : count}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={toggleMuted}
              aria-label={muted ? "Unmute notification sound" : "Mute notification sound"}
              title={muted ? "Sound off" : "Sound on"}
            >
              {muted ? (
                <VolumeX className="size-4 text-muted-foreground" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              disabled={markAll.isPending || count === 0}
              onClick={() => markAll.mutate()}
            >
              <CheckCheck className="size-3.5" /> Mark all read
            </Button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {list.isLoading ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((n) => {
                const meta = notificationMeta(n);
                const Icon = meta.icon;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => onItemClick(n)}
                      className={cn(
                        "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
                        !n.isRead && "bg-primary/[0.04]",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
                          ICON_TONE[meta.tone] ?? ICON_TONE.neutral,
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1 space-y-0.5">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">
                            {meta.title}
                          </span>
                          {!n.isRead ? (
                            <span className="size-2 shrink-0 rounded-full bg-primary" />
                          ) : null}
                        </span>
                        {meta.description ? (
                          <span className="line-clamp-2 block text-xs text-muted-foreground">
                            {meta.description}
                          </span>
                        ) : null}
                        <span className="block text-[11px] text-muted-foreground">
                          {absoluteTime(n.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t p-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            onClick={() => {
              setOpen(false);
              router.push("/admin/notifications");
            }}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
