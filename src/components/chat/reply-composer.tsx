"use client";

import { useRef, useState } from "react";
import { Loader2, Paperclip, SendHorizontal, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutationToast } from "@/lib/hooks/use-mutation-toast";
import { sendMessage } from "@/lib/api/chat";
import { ApiError } from "@/lib/api/client";
import { ACCEPTED_IMAGE_TYPES, uploadImage } from "@/lib/api/uploads";
import type { ChatMessage, SendMessageBody } from "@/lib/types/chat";

/**
 * Reply box. Either a message body or an uploaded attachment is required
 * (matches the backend's 400). Attachments are uploaded to /uploads/image with
 * purpose CHAT_ATTACHMENT, then the returned URL is sent as `attachmentUrl`.
 * Disabled when the conversation is CLOSED.
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      },
    },
  );

  async function onPickFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, "CHAT_ATTACHMENT");
      setAttachmentUrl(url);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Upload failed.";
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const canSend =
    !disabled &&
    !uploading &&
    !mutation.isPending &&
    (body.trim() !== "" || attachmentUrl !== "");

  function submit() {
    if (!canSend) return;
    mutation.mutate({
      body: body.trim() || undefined,
      attachmentUrl: attachmentUrl || undefined,
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
      {attachmentUrl ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attachmentUrl}
            alt="Attachment preview"
            className="max-h-28 w-auto rounded-md border object-cover"
          />
          <button
            type="button"
            onClick={() => setAttachmentUrl("")}
            className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-foreground text-background shadow"
            aria-label="Remove attachment"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0])}
        />
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
          aria-label="Attach image"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Paperclip className="size-4" />
          )}
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
