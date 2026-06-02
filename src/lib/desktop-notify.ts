/**
 * Native (OS-level) desktop notifications. Used to alert staff when a new
 * notification arrives while the tab is in the background.
 */

function supported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/** Ask for permission once (no-op if already decided or unsupported). */
export function ensureNotificationPermission(): void {
  if (!supported()) return;
  if (Notification.permission === "default") {
    void Notification.requestPermission().catch(() => {});
  }
}

/**
 * Show a desktop notification — but ONLY when the tab is hidden (so we don't
 * pop an OS toast while the operator is already looking at the dashboard) and
 * permission has been granted.
 */
export function showDesktopNotification(opts: {
  title: string;
  body?: string;
  tag?: string;
  onClick?: () => void;
}): void {
  if (!supported() || Notification.permission !== "granted") return;
  if (document.visibilityState !== "hidden") return;

  try {
    const n = new Notification(opts.title, { body: opts.body, tag: opts.tag });
    if (opts.onClick) {
      n.onclick = () => {
        window.focus();
        opts.onClick?.();
        n.close();
      };
    }
  } catch {
    // Notification construction can throw on some platforms — ignore.
  }
}
