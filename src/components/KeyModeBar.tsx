"use client";

import { CHROMATIC, MODE_LABELS, type ModeName, type NoteName, randomRoot } from "@/lib/theory";

export type DisplayMode = "note" | "degree";

type Props = {
  root: NoteName;
  onRootChange: (root: NoteName) => void;
  mode: ModeName;
  onModeChange: (mode: ModeName) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
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

        <button
          type="button"
          onClick={() => onDisplayModeChange(displayMode === "note" ? "degree" : "note")}
          className="shrink-0 rounded-full bg-black/5 px-3 py-1 text-sm font-medium text-foreground hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
        >
          {displayMode === "note" ? "Notes" : "Degrees"}
        </button>
      </div>
    </div>
  );
}
