import { cn } from "@/lib/utils";
import { absoluteTime } from "@/lib/format";
import { ImagePreview } from "@/components/shared/image-preview";
import { isImageUrl } from "@/lib/media";
import type { ChatMessage } from "@/lib/types/chat";

/** One chat message. Staff messages sit on the right, customer on the left. */
export function MessageBubble({ message }: { message: ChatMessage }) {
  const isStaff = message.senderRole === "STAFF";

  return (
    <div className={cn("flex", isStaff ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[78%] space-y-1", isStaff ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm",
            isStaff
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-muted text-foreground",
          )}
        >
          {message.body ? (
            <p className="whitespace-pre-wrap break-words">{message.body}</p>
          ) : null}
          {isImageUrl(message.attachmentUrl) ? (
            <div
              className={cn(
                "mt-1.5",
                message.body && "border-t pt-1.5",
                isStaff && "border-primary-foreground/20",
              )}
            >
              <ImagePreview
                src={message.attachmentUrl}
                alt="Attachment"
                imgClassName="max-h-48 w-auto"
              />
            </div>
          ) : message.attachmentUrl ? (
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 block text-xs underline opacity-90"
            >
              View attachment
            </a>
          ) : null}
        </div>
        <p
          className={cn(
            "px-1 text-[11px] text-muted-foreground",
            isStaff ? "text-right" : "text-left",
          )}
          title={absoluteTime(message.createdAt)}
        >
          {isStaff ? "You / staff" : "Customer"} · {absoluteTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
