"use client";

import { useEffect } from "react";
import { useSocket } from "./socket-provider";

/**
 * Joins a conversation's realtime room. The backend only forwards
 * `chat:message` events to sockets that have emitted `chat:join` for that
 * conversation — so this MUST run whenever a conversation thread is open.
 *
 * Emits `chat:join` on mount (and re-joins after any reconnect, since the room
 * membership is per-connection), and `chat:leave` on unmount.
 */
export function useChatRoom(conversationId: string | undefined): void {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !conversationId) return;

    const join = () => socket.emit("chat:join", { conversationId });

    // Join now if already connected, and again on every (re)connect.
    if (socket.connected) join();
    socket.on("connect", join);

    return () => {
      // Best-effort leave; ignored if the socket is already disconnected.
      if (socket.connected) socket.emit("chat:leave", { conversationId });
      socket.off("connect", join);
    };
  }, [socket, conversationId]);
}
