"use client";

import { PageHeader } from "@/components/shared/page-header";
import { FilterBar, SelectFilter } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { ConversationsTable } from "@/components/chat/conversations-table";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { listConversations } from "@/lib/api/chat";
import { CHAT_STATUSES, type ChatStatus } from "@/lib/types/chat";
import { smartLabel } from "@/lib/labels";

export default function ChatQueuePage() {
  const q = usePaginatedQuery({
    queryKey: "conversations",
    filterKeys: ["status", "assignedTo"],
    fetcher: (p) =>
      listConversations({
        page: p.page,
        pageSize: p.pageSize,
        status: p.status as ChatStatus | "",
        assignedTo: (p.assignedTo as "me" | "unassigned" | "") || "",
      }),
  });

  const data = q.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Support"
        description="Customer conversations. Oldest open first — claim one to reply."
      />

      <FilterBar>
        <SelectFilter
          value={q.params.status as string}
          onChange={(v) => q.setFilter("status", v)}
          allLabel="All (open)"
          placeholder="Status"
          options={CHAT_STATUSES.map((s) => ({ value: s, label: smartLabel(s) }))}
        />
        <SelectFilter
          value={q.params.assignedTo as string}
          onChange={(v) => q.setFilter("assignedTo", v)}
          allLabel="Everyone"
          placeholder="Assignment"
          options={[
            { value: "me", label: "Assigned to me" },
            { value: "unassigned", label: "Unassigned" },
          ]}
        />
      </FilterBar>

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
