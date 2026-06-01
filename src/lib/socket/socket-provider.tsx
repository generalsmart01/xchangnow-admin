"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { getSocketAuthAction } from "./actions";

const SocketContext = createContext<Socket | null>(null);

/**
 * Opens a single authenticated Socket.IO connection for the session and shares
 * it via context. Mount inside the authenticated area (admin layout) so the
 * token Server Action has a session cookie to read.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let active = true;
    let s: Socket | null = null;

    getSocketAuthAction().then((auth) => {
      if (!auth || !active) return;

      s = io(auth.url, {
        transports: ["websocket"],
        withCredentials: true,
        // Re-read the (possibly refreshed) token on every (re)connect attempt.
        auth: (cb) => {
          getSocketAuthAction()
            .then((fresh) => cb({ token: fresh?.token ?? auth.token }))
            .catch(() => cb({ token: auth.token }));
        },
      });

      setSocket(s);
    });

    return () => {
      active = false;
      s?.disconnect();
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

/** The shared socket, or null until it has connected. */
export function useSocket(): Socket | null {
  return useContext(SocketContext);
}
