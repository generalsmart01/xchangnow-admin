"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingBlock } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { DetailList, DetailRow } from "@/components/shared/detail-list";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { ConversationStatusBadge } from "@/components/chat/conversation-status-badge";
import { ConversationActions } from "@/components/chat/conversation-actions";
import { MessageThread } from "@/components/chat/message-thread";
import { ReplyComposer } from "@/components/chat/reply-composer";
import { getConversation, markConversationRead } from "@/lib/api/chat";
import { isStaffUnread, partyName } from "@/lib/chat-display";
import { ApiError } from "@/lib/api/client";

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const readForId = useRef<string | null>(null);

  const { data: conversation, isLoading, error } = useQuery({
    queryKey: ["chat", "conversation", id],
    queryFn: () => getConversation(id).then((r) => r.data),
  });

  // Mark read once per conversation when it loads with unread customer activity.
  useEffect(() => {
    if (!conversation || readForId.current === conversation.id) return;
    if (!isStaffUnread(conversation)) return;
    readForId.current = conversation.id;
    markConversationRead(conversation.id)
      .then(() => {
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
        void queryClient.invalidateQueries({
          queryKey: ["chat", "conversation", conversation.id],
        });
      })
      .catch(() => {
        // Non-critical — leave the unread marker if this fails.
        readForId.current = null;
      });
  }, [conversation, queryClient]);

  if (isLoading) return <LoadingBlock label="Loading conversation…" />;

  if (error || !conversation) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <EmptyState
        icon={XCircle}
        title={notFound ? "Conversation not found" : "Couldn't load conversation"}
        description={error instanceof ApiError ? error.message : "Please try again."}
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/chat">
              <ArrowLeft className="size-4" /> Back to support
            </Link>
          </Button>
        }
      />
    );
  }

  const isClosed = conversation.status === "CLOSED";

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/admin/chat">
            <ArrowLeft className="size-4" /> Back to support
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {conversation.subject || "(no subject)"}
          </h1>
          <ConversationStatusBadge status={conversation.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardContent className="max-h-[60vh] overflow-y-auto py-5">
              <MessageThread conversationId={conversation.id} />
            </CardContent>
          </Card>

          <ReplyComposer
            conversationId={conversation.id}
            disabled={isClosed}
            disabledHint="This conversation is closed — no new messages can be sent."
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ConversationActions conversation={conversation} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailList>
                <DetailRow label="Name">{partyName(conversation.user)}</DetailRow>
                <DetailRow label="Email">
                  {conversation.user?.email ?? "—"}
                </DetailRow>
              </DetailList>
              <Separator className="my-3" />
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={`/admin/users/${conversation.userId}`}>
                  View customer profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailList>
                <DetailRow label="Status">
                  <ConversationStatusBadge status={conversation.status} />
                </DetailRow>
                <DetailRow label="Assigned to">
                  {conversation.assignedStaff
                    ? partyName(conversation.assignedStaff)
                    : "Unassigned"}
                </DetailRow>
                <DetailRow label="Opened">
                  <DateTimeDisplay value={conversation.createdAt} />
                </DetailRow>
                <DetailRow label="Last activity">
                  <DateTimeDisplay
                    value={conversation.lastMessageAt ?? conversation.createdAt}
                  />
                </DetailRow>
                {conversation.closedAt ? (
                  <DetailRow label="Closed">
                    <DateTimeDisplay value={conversation.closedAt} />
                  </DetailRow>
                ) : null}
              </DetailList>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
