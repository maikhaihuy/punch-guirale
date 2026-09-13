"use client";

import { DEFAULT_FAMILY_ID, getFamily, getMode } from "@/lib/scales";
import type { PracticeSession } from "@/lib/storage";

function modeLabel(session: PracticeSession): string {
  const family = getFamily(session.familyId ?? DEFAULT_FAMILY_ID);
  const mode = family && getMode(family, session.mode);
  return mode?.displayName ?? session.mode;
}

function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type Props = {
  sessions: PracticeSession[];
};

export function PracticeHistory({ sessions }: Props) {
  return (
    <section className="mx-auto w-full max-w-3xl px-3 py-4">
      <h2 className="mb-2 font-display text-base font-semibold text-text/80">
        Practice history
      </h2>
      {sessions.length === 0 ? (
        <p className="text-sm text-text/50">
          No sessions yet — run the stopwatch and hit Stop to log one.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {sessions.map((s, i) => (
            <li
              key={`${s.date}-${i}`}
              className="flex items-center justify-between gap-2 rounded-lg bg-black/5 px-3 py-2 text-sm dark:bg-white/10"
            >
              <span className="text-text/70">{formatDate(s.date)}</span>
              <span className="font-display font-medium">
                {s.rootNote} {modeLabel(s)}
              </span>
              <span className="text-text/70">{s.bpm} BPM</span>
              <span className="tabular-nums">{formatDuration(s.durationSec)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
