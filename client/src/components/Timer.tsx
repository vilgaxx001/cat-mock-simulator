import { useEffect, useState } from "react";

interface TimerProps {
  /** Authoritative seconds remaining, as of the last server sync. */
  serverSeconds: number;
  /** Epoch ms when serverSeconds was captured — the timer ticks visually from here between syncs. */
  syncedAtMs: number;
  warningThresholdSec: number;
}

function format(totalSec: number): string {
  const s = Math.max(0, totalSec);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function Timer({ serverSeconds, syncedAtMs, warningThresholdSec }: TimerProps) {
  const [displaySec, setDisplaySec] = useState(serverSeconds);

  useEffect(() => {
    const tick = () => {
      const elapsed = Math.floor((Date.now() - syncedAtMs) / 1000);
      setDisplaySec(Math.max(0, serverSeconds - elapsed));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [serverSeconds, syncedAtMs]);

  const isWarning = displaySec <= warningThresholdSec && displaySec > 0;
  const isExpired = displaySec <= 0;

  return (
    <div
      className={[
        "flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-lg font-medium tnum transition-colors",
        isExpired
          ? "border-status-notanswered bg-red-50 text-status-notanswered"
          : isWarning
          ? "border-warn bg-amber-50 text-warn"
          : "border-line bg-white text-ink",
      ].join(" ")}
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${format(displaySec)}`}
    >
      <span className={["h-2 w-2 rounded-full", isExpired ? "bg-status-notanswered" : isWarning ? "bg-warn" : "bg-accent"].join(" ")} />
      {format(displaySec)}
    </div>
  );
}
