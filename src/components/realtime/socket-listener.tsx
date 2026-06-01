"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/lib/socket/socket-provider";
import type { ChatMessage } from "@/lib/types/chat";

/**
 * Global, headless listener: turns realtime socket events into TanStack Query
 * cache invalidations so the relevant screens refetch. Mounted once in the
 * admin layout. (Per-conversation joining lives in `useChatRoom`.)
 */
export function SocketListener() {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    function onChatMessage(msg: ChatMessage) {
      const id = msg?.conversationId;
      if (id) {
        void queryClient.invalidateQueries({ queryKey: ["chat", "messages", id] });
        void queryClient.invalidateQueries({
          queryKey: ["chat", "conversation", id],
        });
      }
      // The queue ordering / unread markers depend on any conversation's
      // last message, so refresh the list too.
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }

    socket.on("chat:message", onChatMessage);
    return () => {
      socket.off("chat:message", onChatMessage);
    };
  }, [socket, queryClient]);

  return null;
}
