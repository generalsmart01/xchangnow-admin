"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { MessagesSquare } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { ConversationStatusBadge } from "./conversation-status-badge";
import { isStaffUnread, partyName } from "@/lib/chat-display";
import { cn } from "@/lib/utils";
import type { ChatConversation } from "@/lib/types/chat";

const columns: ColumnDef<ChatConversation>[] = [
  {
    header: "Subject",
    cell: ({ row }) => {
      const c = row.original;
      const unread = isStaffUnread(c);
      return (
        <div className="flex items-center gap-2">
          {unread ? (
            <span
              className="size-2 shrink-0 rounded-full bg-primary"
              aria-label="Unread"
            />
          ) : (
            <span className="size-2 shrink-0" />
          )}
          <span
            className={cn(
              "max-w-[280px] truncate",
              unread ? "font-semibold" : "font-medium",
            )}
          >
            {c.subject || "(no subject)"}
          </span>
        </div>
      );
    },
  },
  {
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{partyName(row.original.user)}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.user?.email ?? "—"}
        </span>
      </div>
    ),
  },
  {
    header: "Status",
    cell: ({ row }) => <ConversationStatusBadge status={row.original.status} />,
  },
  {
    header: "Assigned",
    cell: ({ row }) =>
      row.original.assignedStaff ? (
        <span className="text-sm">{partyName(row.original.assignedStaff)}</span>
      ) : (
        <span className="text-sm text-muted-foreground">Unassigned</span>
      ),
  },
  {
    header: "Last activity",
    cell: ({ row }) => (
      <DateTimeDisplay
        value={row.original.lastMessageAt ?? row.original.createdAt}
        className="text-sm text-muted-foreground"
      />
    ),
  },
];

export function ConversationsTable({
  conversations,
  loading,
}: {
  conversations: ChatConversation[];
  loading?: boolean;
}) {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      data={conversations}
      loading={loading}
      getRowId={(c) => c.id}
      onRowClick={(c) => router.push(`/admin/chat/${c.id}`)}
      emptyState={
        <EmptyState
          icon={MessagesSquare}
          title="No conversations"
          description="Support conversations from customers will appear here."
          className="border-0 py-12"
        />
      }
    />
  );
}
