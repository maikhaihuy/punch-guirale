"use client";

import type { StopwatchStatus } from "@/hooks/useStopwatch";

function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Props = {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  isMetronomePlaying: boolean;
  onToggleMetronome: () => void;
  stopwatchStatus: StopwatchStatus;
  elapsedSec: number;
  onStopwatchStart: () => void;
  onStopwatchPause: () => void;
  onStopwatchResume: () => void;
  onStopwatchStop: () => void;
};

export function PracticeControls({
  bpm,
  onBpmChange,
  isMetronomePlaying,
  onToggleMetronome,
  stopwatchStatus,
  elapsedSec,
  onStopwatchStart,
  onStopwatchPause,
  onStopwatchResume,
  onStopwatchStop,
}: Props) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/95 backdrop-blur-sm dark:border-white/10 dark:bg-black/95"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-sm font-medium text-foreground/70">
            {bpm} BPM
          </span>
          <input
            type="range"
            min={30}
            max={240}
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className="w-full min-w-[100px] flex-1 sm:w-32"
            aria-label="Metronome BPM"
          />
          <button
            type="button"
            onClick={onToggleMetronome}
            className={`shrink-0 rounded-full px-4 py-3 text-sm font-semibold ${
              isMetronomePlaying
                ? "bg-foreground text-background"
                : "bg-black/10 text-foreground dark:bg-white/15"
            }`}
          >
            {isMetronomePlaying ? "Stop" : "Metronome"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="min-w-[3.5rem] font-mono text-lg tabular-nums text-foreground">
            {formatDuration(elapsedSec)}
          </span>
          {stopwatchStatus === "idle" && (
            <button
              type="button"
              onClick={onStopwatchStart}
              className="shrink-0 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background"
            >
              Start
            </button>
          )}
          {stopwatchStatus === "running" && (
            <>
              <button
                type="button"
                onClick={onStopwatchPause}
                className="shrink-0 rounded-full bg-black/10 px-5 py-3 text-sm font-semibold text-foreground dark:bg-white/15"
              >
                Pause
              </button>
              <button
                type="button"
                onClick={onStopwatchStop}
                className="shrink-0 rounded-full bg-red-600/90 px-5 py-3 text-sm font-semibold text-white"
              >
                Stop
              </button>
            </>
          )}
          {stopwatchStatus === "paused" && (
            <>
              <button
                type="button"
                onClick={onStopwatchResume}
                className="shrink-0 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background"
              >
                Resume
              </button>
              <button
                type="button"
                onClick={onStopwatchStop}
                className="shrink-0 rounded-full bg-red-600/90 px-5 py-3 text-sm font-semibold text-white"
              >
                Stop
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
