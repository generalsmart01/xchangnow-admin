"use client";

import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/lib/hooks/use-confirm";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  assignConversation,
  closeConversation,
  resolveConversation,
} from "@/lib/api/chat";
import { listStaff } from "@/lib/api/staff";
import { partyName } from "@/lib/chat-display";
import { fullName } from "@/lib/format";
import type { ChatConversation } from "@/lib/types/chat";

/** Dispatch the conversation to another staff member (ADMIN/SUPER_ADMIN only). */
function DispatchDropdown({
  conversationId,
  onDone,
}: {
  conversationId: string;
  onDone?: () => void;
}) {
  const { user } = useAuth();

  const staff = useQuery({
    queryKey: ["staff", "dispatch"],
    queryFn: () => listStaff({ pageSize: 100 }).then((r) => r.data.staff),
  });

  const dispatch = useMutationToast<ChatConversation, string>(
    (staffId) =>
      assignConversation(conversationId, { staffId }).then((r) => r.data),
    {
      successMessage: "Conversation dispatched",
      invalidate: [["chat", "conversation", conversationId], ["conversations"]],
      onSuccess: () => onDone?.(),
    },
  );

  const options = (staff.data ?? []).filter((s) => s.id !== user.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={dispatch.isPending}>
          {dispatch.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Dispatch to… <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
        <DropdownMenuLabel>Assign to staff</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {staff.isLoading ? (
          <DropdownMenuItem disabled>Loading…</DropdownMenuItem>
        ) : options.length === 0 ? (
          <DropdownMenuItem disabled>No other staff</DropdownMenuItem>
        ) : (
          options.map((s) => (
            <DropdownMenuItem
              key={s.id}
              onSelect={() => dispatch.mutate(s.id)}
            >
              <div className="flex flex-col">
                <span className="text-sm">{fullName(s)}</span>
                <span className="text-xs text-muted-foreground">{s.email}</span>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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

  const isPending = conversation.status === "PENDING_STAFF";
  const isClosed = conversation.status === "CLOSED";
  const mine = conversation.assignedStaffId === user.id;

  // Needs a claim — operator picks it up, or an admin dispatches it.
  if (isPending) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button disabled={claim.isPending} onClick={() => claim.mutate()}>
          {claim.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserCheck className="size-4" />
          )}
          Claim for self
        </Button>
        {user.role !== "OPS" ? <DispatchDropdown conversationId={id} /> : null}
      </div>
    );
  }

  if (isClosed) {
    return (
      <p className="text-sm text-muted-foreground">
        This conversation is closed.
      </p>
    );
  }

  // Assigned to someone else — read-only for this staff member.
  if (!mine) {
    return (
      <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        Assigned to{" "}
        <span className="font-medium text-foreground">
          {partyName(conversation.assignedStaff)}
        </span>
        . You can&apos;t reply unless it&apos;s reassigned to you.
      </div>
    );
  }

  // I'm the assigned staff.
  return (
    <div className="flex flex-wrap gap-2">
      {conversation.status === "OPEN" ? (
        <Button
          variant="outline"
          size="sm"
          disabled={resolve.isPending}
          onClick={() => resolve.mutate()}
        >
          {resolve.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          Mark resolved
        </Button>
      ) : null}
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={close.isPending}
        onClick={async () => {
          const ok = await confirm({
            title: "Close this conversation?",
            description:
              "Closing is permanent — no new messages can be sent and the customer can't re-open it.",
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
    </div>
  );
}
