"use client";

import { CheckCircle2, Loader2, UserCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/lib/hooks/use-confirm";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  assignConversation,
  closeConversation,
  resolveConversation,
} from "@/lib/api/chat";
import type { ChatConversation } from "@/lib/types/chat";

export function ConversationActions({
  conversation,
}: {
  conversation: ChatConversation;
}) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const id = conversation.id;

  const invalidate = [
    ["chat", "conversation", id] as unknown[],
    ["conversations"] as unknown[],
  ];

  const claim = useMutationToast<ChatConversation, void>(
    () => assignConversation(id).then((r) => r.data),
    { successMessage: "Conversation claimed", invalidate },
  );
  const resolve = useMutationToast<ChatConversation, void>(
    () => resolveConversation(id).then((r) => r.data),
    { successMessage: "Marked resolved", invalidate },
  );
  const close = useMutationToast<ChatConversation, void>(
    () => closeConversation(id).then((r) => r.data),
    { successMessage: "Conversation closed", invalidate },
  );

  const isClosed = conversation.status === "CLOSED";
  const isResolved = conversation.status === "RESOLVED";
  const mine = conversation.assignedStaffId === user.id;
  const pending = claim.isPending || resolve.isPending || close.isPending;

  return (
    <div className="flex flex-wrap gap-2">
      {!isClosed && !mine ? (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => claim.mutate()}
        >
          {claim.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserCheck className="size-4" />
          )}
          {conversation.assignedStaffId ? "Claim (reassign)" : "Claim"}
        </Button>
      ) : null}

      {!isClosed && !isResolved ? (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => resolve.mutate()}
        >
          {resolve.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          Resolve
        </Button>
      ) : null}

      {!isClosed ? (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={pending}
          onClick={async () => {
            const ok = await confirm({
              title: "Close this conversation?",
              description:
                "Closing is permanent — no new messages can be sent. The customer can't re-open it.",
              confirmText: "Close",
              variant: "destructive",
            });
            if (ok) close.mutate();
          }}
        >
          {close.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <XCircle className="size-4" />
          )}
          Close
        </Button>
      ) : null}
    </div>
  );
}
