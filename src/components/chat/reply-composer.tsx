"use client";

import { useState } from "react";
import { Loader2, Paperclip, SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { sendMessage } from "@/lib/api/chat";
import type { ChatMessage, SendMessageBody } from "@/lib/types/chat";

/**
 * Reply box. Either a message body or an attachment URL is required (matches
 * the backend's 400). Disabled when the conversation is CLOSED.
 */
export function ReplyComposer({
  conversationId,
  disabled,
  disabledHint,
}: {
  conversationId: string;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const [body, setBody] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [showAttach, setShowAttach] = useState(false);

  const mutation = useMutationToast<ChatMessage, SendMessageBody>(
    (payload) => sendMessage(conversationId, payload).then((r) => r.data),
    {
      invalidate: [
        ["chat", "messages", conversationId],
        ["chat", "conversation", conversationId],
        ["conversations"],
      ],
      onSuccess: () => {
        setBody("");
        setAttachmentUrl("");
        setShowAttach(false);
      },
    },
  );

  const canSend =
    !disabled &&
    !mutation.isPending &&
    (body.trim() !== "" || attachmentUrl.trim() !== "");

  function submit() {
    if (!canSend) return;
    mutation.mutate({
      body: body.trim() || undefined,
      attachmentUrl: attachmentUrl.trim() || undefined,
    });
  }

  if (disabled) {
    return (
      <div className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
        {disabledHint ?? "This conversation is closed."}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showAttach ? (
        <Input
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
          placeholder="https://… attachment URL"
          className="font-mono text-xs"
        />
      ) : null}
      <div className="flex items-end gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a reply…  (Enter to send, Shift+Enter for newline)"
          rows={2}
          className="min-h-[44px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Attach"
          className={showAttach ? "text-primary" : undefined}
          onClick={() => setShowAttach((v) => !v)}
        >
          <Paperclip className="size-4" />
        </Button>
        <Button type="button" disabled={!canSend} onClick={submit}>
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <SendHorizontal className="size-4" />
          )}
          Send
        </Button>
      </div>
    </div>
  );
}
