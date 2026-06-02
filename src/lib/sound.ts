/**
 * Notification chime via the Web Audio API — no audio asset to ship, and it
 * respects a persisted mute preference. Playback may be blocked until the user
 * has interacted with the page (browser autoplay policy); failures are ignored.
 */

const MUTE_KEY = "xcn:notif-muted";

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;

export function isChimeMuted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MUTE_KEY) === "1";
}

export function setChimeMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
}

/** Play a short two-tone chime, unless muted. Safe to call anywhere. */
export function playChime(): void {
  if (typeof window === "undefined" || isChimeMuted()) return;

  try {
    const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!AC) return;
    ctx = ctx ?? new AC();
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    // A5 then D6 — a gentle rising "ding-dong".
    [880, 1174.66].forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.12;
      const dur = 0.2;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.16, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
  } catch {
    // Audio unavailable or blocked — silently ignore.
  }
}
