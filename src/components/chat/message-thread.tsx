"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, MessagesSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageBubble } from "./message-bubble";
import { listMessages } from "@/lib/api/chat";
import { useChatRoom } from "@/lib/socket/use-chat-room";

export function MessageThread({ conversationId }: { conversationId: string }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Join the realtime room — without this `chat:join`, the backend never
  // forwards `chat:message` events for this conversation.
  useChatRoom(conversationId);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["chat", "messages", conversationId],
    queryFn: ({ pageParam }) =>
      listMessages(conversationId, { pageSize: 50, before: pageParam }).then(
        (r) => r.data,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || lastPage.messages.length === 0) return undefined;
      // Oldest message in this (newest-first) page becomes the next cursor.
      return lastPage.messages[lastPage.messages.length - 1].createdAt;
    },
  });

  // Pages are newest-first and go newest → older; flatten then reverse to
  // chronological (oldest at top, newest at bottom).
  const messages = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.messages) ?? [];
    return [...all].reverse();
  }, [data]);

  // Auto-scroll to the bottom only when a NEW latest message arrives (not when
  // older history is loaded above).
  const lastId = messages[messages.length - 1]?.id;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lastId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-10">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="No messages yet"
        description="Send the first reply to start the conversation."
        className="border-0 py-10"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Load older messages
          </Button>
        </div>
      ) : null}

      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
