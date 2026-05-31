"use client";

import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { FilterBar, SelectFilter } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingBlock } from "@/components/shared/loading-spinner";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import { notificationMeta } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import type { AdminNotification } from "@/lib/types/notification";
import { Bell } from "lucide-react";

const ICON_TONE: Record<string, string> = {
  info: "bg-info/10 text-info",
  brand: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-warning-foreground",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-foreground/5 text-foreground",
  success: "bg-success/12 text-success",
  muted: "bg-muted text-muted-foreground",
};

export default function NotificationsPage() {
  const router = useRouter();

  const q = usePaginatedQuery({
    queryKey: "notifications",
    filterKeys: ["unread"],
    fetcher: (p) =>
      listNotifications({
        page: p.page,
        pageSize: p.pageSize,
        unreadOnly: p.unread === "true",
      }).then((data) => ({ data })),
  });

  const data = q.data;
  const items = data?.notifications ?? [];

  const markRead = useMutationToast<unknown, string>(
    (id) => markNotificationRead(id),
    { invalidate: [["notifications"]] },
  );
  const markAll = useMutationToast<unknown, void>(
    () => markAllNotificationsRead(),
    {
      successMessage: "All notifications marked read",
      invalidate: [["notifications"]],
    },
  );

  function onClick(n: AdminNotification) {
    if (!n.isRead) markRead.mutate(n.id);
    const { href } = notificationMeta(n);
    if (href) router.push(href);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description="Transaction, KYC and system alerts for staff."
        actions={
          <Button
            variant="outline"
            disabled={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        }
      />

      <FilterBar>
        <SelectFilter
          value={q.params.unread as string}
          onChange={(v) => q.setFilter("unread", v)}
          allLabel="All"
          placeholder="Show"
          options={[{ value: "true", label: "Unread only" }]}
        />
      </FilterBar>

      {q.isLoading ? (
        <LoadingBlock label="Loading notifications…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="Staff alerts will show up here."
        />
      ) : (
        <Card className="divide-y overflow-hidden p-0">
          {items.map((n) => {
            const meta = notificationMeta(n);
            const Icon = meta.icon;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => onClick(n)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                  !n.isRead && "bg-primary/[0.04]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full",
                    ICON_TONE[meta.tone] ?? ICON_TONE.neutral,
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{meta.title}</span>
                    {!n.isRead ? (
                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  {meta.description ? (
                    <p className="text-sm text-muted-foreground">
                      {meta.description}
                    </p>
                  ) : null}
                  <DateTimeDisplay
                    value={n.createdAt}
                    className="text-xs text-muted-foreground"
                  />
                </div>
              </button>
            );
          })}
        </Card>
      )}

      {data ? (
        <Pagination
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={q.setPage}
          disabled={q.isFetching}
        />
      ) : null}
    </div>
  );
}
