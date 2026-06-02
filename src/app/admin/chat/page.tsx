"use client";

import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ConversationsTable } from "@/components/chat/conversations-table";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { listConversations, type ListConversationsParams } from "@/lib/api/chat";

type Tab = "pending" | "mine" | "all-open";

/** Map a tab to the conversation-list query params. */
function tabParams(tab: string): ListConversationsParams {
  if (tab === "mine") return { assignedTo: "me" };
  if (tab === "all-open") return { status: "OPEN" };
  return { status: "PENDING_STAFF" };
}

export default function ChatQueuePage() {
  const q = usePaginatedQuery({
    queryKey: "conversations",
    filterKeys: ["tab"],
    defaults: { tab: "pending" },
    fetcher: (p) =>
      listConversations({
        page: p.page,
        pageSize: p.pageSize,
        ...tabParams(p.tab as string),
      }),
  });

  // Badge counts (total from a pageSize=1 probe). Keyed under "conversations"
  // so socket-driven invalidation refreshes them too.
  const pendingCount = useQuery({
    queryKey: ["conversations", "count", "pending"],
    queryFn: () =>
      listConversations({ status: "PENDING_STAFF", pageSize: 1 }).then(
        (r) => r.data.total,
      ),
  });
  const mineCount = useQuery({
    queryKey: ["conversations", "count", "mine"],
    queryFn: () =>
      listConversations({ assignedTo: "me", pageSize: 1 }).then(
        (r) => r.data.total,
      ),
  });

  const tab = (q.params.tab as Tab) || "pending";
  const data = q.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Support"
        description="Customer conversations. Claim one from the queue to reply."
      />

      <Tabs value={tab} onValueChange={(v) => q.setFilter("tab", v)}>
        <TabsList>
          <TabsTrigger value="pending">
            Needs claim
            {pendingCount.data ? (
              <Badge variant="secondary" className="ml-1.5">
                {pendingCount.data}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="mine">
            My conversations
            {mineCount.data ? (
              <Badge variant="secondary" className="ml-1.5">
                {mineCount.data}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="all-open">All open</TabsTrigger>
        </TabsList>
      </Tabs>

      <ConversationsTable
        conversations={data?.conversations ?? []}
        loading={q.isLoading}
      />

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
