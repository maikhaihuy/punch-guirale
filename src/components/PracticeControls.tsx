"use client";

import { CircleStop, Metronome, Pause, Play, Timer } from "lucide-react";

import type { StopwatchStatus } from "@/hooks/useStopwatch";

const BPM_MIN = 30;
const BPM_MAX = 240;
const BPM_STEP = 5;

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
      className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-black/10 bg-surface/95 px-4 py-3 shadow-lg backdrop-blur-sm dark:border-white/10"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2">
        <Metronome className="size-5 shrink-0 text-text-muted" aria-hidden />
        <button
          type="button"
          onClick={() => onBpmChange(Math.max(BPM_MIN, bpm - BPM_STEP))}
          aria-label="Decrease BPM"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-lg font-semibold text-text hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
        >
          −
        </button>
        <span className="w-10 shrink-0 text-center tabular-nums font-medium text-text">
          {bpm}
        </span>
        <button
          type="button"
          onClick={() => onBpmChange(Math.min(BPM_MAX, bpm + BPM_STEP))}
          aria-label="Increase BPM"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-lg font-semibold text-text hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
        >
          +
        </button>
        <button
          type="button"
          onClick={onToggleMetronome}
          aria-label={isMetronomePlaying ? "Pause metronome" : "Start metronome"}
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
            isMetronomePlaying
              ? "bg-text text-bg"
              : "bg-black/10 text-text dark:bg-white/15"
          }`}
        >
          {isMetronomePlaying ? (
            <Pause className="size-4" aria-hidden />
          ) : (
            <Play className="size-4" aria-hidden />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Timer className="size-5 shrink-0 text-text-muted" aria-hidden />
        <span className="min-w-14 text-lg tabular-nums text-text">
          {formatDuration(elapsedSec)}
        </span>
        {stopwatchStatus === "idle" && (
          <button
            type="button"
            onClick={onStopwatchStart}
            aria-label="Start stopwatch"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-text text-bg"
          >
            <Play className="size-4" aria-hidden />
          </button>
        )}
        {stopwatchStatus === "running" && (
          <>
            <button
              type="button"
              onClick={onStopwatchPause}
              aria-label="Pause stopwatch"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black/10 text-text dark:bg-white/15"
            >
              <Pause className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onStopwatchStop}
              aria-label="Stop stopwatch"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-600/90 text-white"
            >
              <CircleStop className="size-4" aria-hidden />
            </button>
          </>
        )}
        {stopwatchStatus === "paused" && (
          <>
            <button
              type="button"
              onClick={onStopwatchResume}
              aria-label="Resume stopwatch"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-text text-bg"
            >
              <Play className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onStopwatchStop}
              aria-label="Stop stopwatch"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-600/90 text-white"
            >
              <CircleStop className="size-4" aria-hidden />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
