"use client";

import { CHROMATIC, MODE_LABELS, type ModeName, type NoteName, randomRoot } from "@/lib/theory";
import { POSITION_IDS, type PositionId } from "@/lib/positions";

export type DisplayMode = "note" | "degree";
export type SelectedPosition = "all" | PositionId;

type Props = {
  root: NoteName;
  onRootChange: (root: NoteName) => void;
  mode: ModeName;
  onModeChange: (mode: ModeName) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  selectedPosition: SelectedPosition;
  onSelectedPositionChange: (position: SelectedPosition) => void;
  highlightTriad: boolean;
  onHighlightTriadChange: (highlight: boolean) => void;
};

const MODE_ORDER: ModeName[] = [
  "ionian",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "aeolian",
  "locrian",
];

export function KeyModeBar({
  root,
  onRootChange,
  mode,
  onModeChange,
  displayMode,
  onDisplayModeChange,
  selectedPosition,
  onSelectedPositionChange,
  highlightTriad,
  onHighlightTriadChange,
}: Props) {
  return (
    <div className="flex flex-col gap-2 border-b border-black/10 bg-white/95 px-3 py-2 backdrop-blur-sm dark:border-white/10 dark:bg-black/95">
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {CHROMATIC.map((note) => (
          <button
            key={note}
            type="button"
            onClick={() => onRootChange(note)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-medium transition-colors ${
              note === root
                ? "bg-foreground text-background"
                : "bg-black/5 text-foreground hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
            }`}
          >
            {note}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onRootChange(randomRoot())}
          className="shrink-0 rounded-full border border-black/15 px-2.5 py-1 text-sm font-medium text-foreground hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          aria-label="Randomize root note"
          title="Randomize root note"
        >
          🎲
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 gap-1.5 overflow-x-auto">
          {MODE_ORDER.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              className={`shrink-0 rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                m === mode
                  ? "bg-foreground text-background"
                  : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => onHighlightTriadChange(!highlightTriad)}
            aria-pressed={highlightTriad}
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              highlightTriad
                ? "bg-foreground text-background"
                : "bg-black/5 text-foreground hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
            }`}
          >
            Highlight triad
          </button>
          <button
            type="button"
            onClick={() => onDisplayModeChange(displayMode === "note" ? "degree" : "note")}
            className="shrink-0 rounded-full bg-black/5 px-3 py-1 text-sm font-medium text-foreground hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
          >
            {displayMode === "note" ? "Notes" : "Degrees"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        <span className="shrink-0 text-xs font-medium text-foreground/50">Position</span>
        <button
          type="button"
          onClick={() => onSelectedPositionChange("all")}
          className={`shrink-0 rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
            selectedPosition === "all"
              ? "bg-foreground text-background"
              : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10"
          }`}
        >
          All
        </button>
        {POSITION_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectedPositionChange(id)}
            className={`shrink-0 rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
              selectedPosition === id
                ? "bg-foreground text-background"
                : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {id}
          </button>
        ))}
      </div>
    </div>
  );
}
