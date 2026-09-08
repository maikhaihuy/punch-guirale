"use client";

import { useEffect, useRef } from "react";

export function useWakeLock(active: boolean) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    (async () => {
      try {
        const sentinel = await navigator.wakeLock?.request("screen");
        if (cancelled) {
          void sentinel?.release();
          return;
        }
        sentinelRef.current = sentinel ?? null;
      } catch {
        // Wake Lock API unsupported or denied — fail silently, never block practice.
      }
    })();

    return () => {
      cancelled = true;
      void sentinelRef.current?.release();
      sentinelRef.current = null;
    };
  }, [active]);
}
