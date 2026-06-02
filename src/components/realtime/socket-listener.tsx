"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocket } from "@/lib/socket/socket-provider";
import { notificationMeta } from "@/lib/notifications";
import { playChime } from "@/lib/sound";
import type { AdminNotification } from "@/lib/types/notification";
import type { ChatMessage } from "@/lib/types/chat";

/** Refresh the screens that a given event type affects. */
function invalidateForType(qc: QueryClient, type: string | undefined) {
  if (!type) return;
  if (type.startsWith("chat.")) {
    void qc.invalidateQueries({ queryKey: ["conversations"] });
  }
  if (type === "transaction.proof_uploaded") {
    void qc.invalidateQueries({ queryKey: ["transactions"] });
    void qc.invalidateQueries({ queryKey: ["dashboard"] });
  }
  if (type === "kyc.submitted") {
    void qc.invalidateQueries({ queryKey: ["kyc"] });
    void qc.invalidateQueries({ queryKey: ["dashboard"] });
  }
}

/**
 * Global, headless realtime listener. Staff sockets auto-join `staff:all`
 * server-side, so this turns broadcast + notification events into TanStack
 * Query invalidations (the queue/dashboard refetch) and surfaces the "you've
 * been assigned" toast. Per-conversation message streaming is joined in
 * `useChatRoom`.
 */
export function SocketListener() {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    // A new notification for this staff member.
    function onNotification(raw: Record<string, unknown>) {
      const type = (raw.eventType ?? raw.type) as string | undefined;
      const payload = (raw.payload ?? raw) as Record<string, unknown> | null;

      // Audible alert for every incoming notification (respects mute pref).
      playChime();

      // Refresh the bell (unread count + list) and any affected screens.
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      invalidateForType(queryClient, type);

      // The assignment notification only fires for the assignee — toast it.
      if (type === "chat.conversation_assigned") {
        const meta = notificationMeta({
          id: "",
          type,
          title: null,
          body: null,
          payload,
          isRead: false,
          readAt: null,
          createdAt: "",
        } as AdminNotification);
        toast(meta.title, {
          description: meta.description,
          action: meta.href
            ? { label: "Open", onClick: () => router.push(meta.href as string) }
            : undefined,
        });
      }
    }

    // Queue-refresh broadcasts (to staff:all).
    function refreshQueue() {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }

    // A message in a specific conversation (room must be joined — see useChatRoom).
    function onChatMessage(evt: { conversationId?: string; message?: ChatMessage }) {
      const id = evt?.conversationId ?? evt?.message?.conversationId;
      if (id) {
        void queryClient.invalidateQueries({ queryKey: ["chat", "messages", id] });
        void queryClient.invalidateQueries({ queryKey: ["chat", "conversation", id] });
      }
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }

    socket.on("notification:new", onNotification);
    socket.on("chat:conversation_opened", refreshQueue);
    socket.on("chat:conversation_assigned", refreshQueue);
    socket.on("chat:user_message", refreshQueue);
    socket.on("chat:message", onChatMessage);

    return () => {
      socket.off("notification:new", onNotification);
      socket.off("chat:conversation_opened", refreshQueue);
      socket.off("chat:conversation_assigned", refreshQueue);
      socket.off("chat:user_message", refreshQueue);
      socket.off("chat:message", onChatMessage);
    };
  }, [socket, queryClient, router]);

  return null;
}
