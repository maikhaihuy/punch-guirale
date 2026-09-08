"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type StopwatchStatus = "idle" | "running" | "paused";

export function useStopwatch() {
  const [status, setStatus] = useState<StopwatchStatus>("idle");
  const [elapsedSec, setElapsedSec] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef(0);

  const tick = useCallback(() => {
    const startedAt = startedAtRef.current;
    const base = accumulatedMsRef.current + (startedAt !== null ? Date.now() - startedAt : 0);
    setElapsedSec(Math.floor(base / 1000));
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [status, tick]);

  const start = useCallback(() => {
    accumulatedMsRef.current = 0;
    startedAtRef.current = Date.now();
    setElapsedSec(0);
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    setStatus((prev) => {
      if (prev !== "running" || startedAtRef.current === null) return prev;
      accumulatedMsRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = null;
      return "paused";
    });
  }, []);

  const resume = useCallback(() => {
    setStatus((prev) => {
      if (prev !== "paused") return prev;
      startedAtRef.current = Date.now();
      return "running";
    });
  }, []);

  const stop = useCallback((): number => {
    const startedAt = startedAtRef.current;
    const totalMs = accumulatedMsRef.current + (startedAt !== null ? Date.now() - startedAt : 0);
    startedAtRef.current = null;
    accumulatedMsRef.current = 0;
    setStatus("idle");
    setElapsedSec(0);
    return Math.floor(totalMs / 1000);
  }, []);

  return { status, elapsedSec, start, pause, resume, stop };
}
