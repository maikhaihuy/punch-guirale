"use client";

import type { FretNote } from "@/lib/theory";

type Props = {
  fretboard: FretNote[][]; // [stringIndex][fret], stringIndex 0 = low E .. 5 = high E
  displayMode: "note" | "degree";
};

const STRING_NAMES = ["E", "A", "D", "G", "B", "E"]; // low E to high E, matches OPEN_STRINGS order
const FRET_WIDTH = 52;
const STRING_LABEL_WIDTH = 28;
const STRING_GAP = 40;
const TOP_PADDING = 20;
const BOTTOM_PADDING = 20;
const DOT_RADIUS = 14;

export function Fretboard({ fretboard, displayMode }: Props) {
  const numStrings = fretboard.length;
  const numFrets = fretboard[0]?.length ?? 0;
  const boardWidth = STRING_LABEL_WIDTH + FRET_WIDTH * numFrets;
  const boardHeight = TOP_PADDING + BOTTOM_PADDING + STRING_GAP * (numStrings - 1);

  const stringY = (stringIndex: number) =>
    TOP_PADDING + (numStrings - 1 - stringIndex) * STRING_GAP;
  const fretX = (fret: number) => STRING_LABEL_WIDTH + fret * FRET_WIDTH + FRET_WIDTH / 2;

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden bg-white dark:bg-black">
      <div style={{ width: boardWidth, minWidth: boardWidth }}>
        <div
          className="sticky top-0 z-10 flex border-b border-black/10 bg-white/95 backdrop-blur-sm dark:border-white/10 dark:bg-black/95"
          style={{ width: boardWidth }}
        >
          <div style={{ width: STRING_LABEL_WIDTH }} />
          {Array.from({ length: numFrets }, (_, fret) => (
            <div
              key={fret}
              className="flex shrink-0 items-center justify-center text-xs font-medium text-foreground/60"
              style={{ width: FRET_WIDTH }}
            >
              {fret}
            </div>
          ))}
        </div>

        <svg width={boardWidth} height={boardHeight} role="img" aria-label="Fretboard">
          {Array.from({ length: numFrets }, (_, fret) => (
            <line
              key={`fretline-${fret}`}
              x1={STRING_LABEL_WIDTH + fret * FRET_WIDTH}
              x2={STRING_LABEL_WIDTH + fret * FRET_WIDTH}
              y1={TOP_PADDING - 8}
              y2={boardHeight - BOTTOM_PADDING + 8}
              stroke="currentColor"
              strokeWidth={fret === 0 ? 4 : 1}
              className="text-black/20 dark:text-white/20"
            />
          ))}

          {STRING_NAMES.map((name, stringIndex) => (
            <g key={`string-${stringIndex}`}>
              <line
                x1={STRING_LABEL_WIDTH}
                x2={boardWidth}
                y1={stringY(stringIndex)}
                y2={stringY(stringIndex)}
                stroke="currentColor"
                strokeWidth={1.5}
                className="text-black/30 dark:text-white/30"
              />
              <text
                x={STRING_LABEL_WIDTH / 2}
                y={stringY(stringIndex)}
                dominantBaseline="middle"
                textAnchor="middle"
                className="fill-foreground/60 text-[11px] font-medium"
              >
                {name}
              </text>
            </g>
          ))}

          {fretboard.map((frets, stringIndex) =>
            frets.map((note) => {
              if (!note.inScale) return null;
              const label = displayMode === "note" ? note.name : note.degree;
              return (
                <g key={`note-${stringIndex}-${note.fret}`}>
                  <circle
                    cx={fretX(note.fret)}
                    cy={stringY(stringIndex)}
                    r={DOT_RADIUS}
                    className={
                      note.isRoot
                        ? "fill-foreground stroke-foreground"
                        : "fill-white stroke-foreground/70 dark:fill-black"
                    }
                    strokeWidth={2}
                  />
                  <text
                    x={fretX(note.fret)}
                    y={stringY(stringIndex)}
                    dominantBaseline="middle"
                    textAnchor="middle"
                    className={
                      note.isRoot
                        ? "fill-background text-[10px] font-semibold"
                        : "fill-foreground text-[10px] font-semibold"
                    }
                  >
                    {label}
                  </text>
                </g>
              );
            }),
          )}
        </svg>
      </div>
    </div>
  );
}
