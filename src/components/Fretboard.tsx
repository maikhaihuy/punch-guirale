"use client";

import { useEffect, useRef, useState } from "react";

import type { SelectedPosition } from "@/components/KeyModeBar";
import type { FretNote } from "@/lib/theory";

type Props = {
  fretboard: FretNote[][]; // [stringIndex][fret], stringIndex 0 = low E .. 5 = high E
  displayMode: "note" | "degree";
  selectedPosition: SelectedPosition;
  positionRanges: Array<{ lo: number; hi: number }>; // absolute fret ranges for selectedPosition, empty when "all"
  onNotePlay: (note: FretNote) => void;
  autoFitMobile: boolean;
};

const STRING_NAMES = ["E", "A", "D", "G", "B", "E"]; // low E to high E, matches OPEN_STRINGS order
const FRET_WIDTH = 52;
const MIN_ZOOM_FRET_WIDTH = 28;
const STRING_LABEL_WIDTH = 28;
const STRING_GAP = 40;
const TOP_PADDING = 20;
const BOTTOM_PADDING = 20;
const DOT_RADIUS = 14;
const TOUCH_RADIUS = 22;

export function Fretboard({
  fretboard,
  displayMode,
  selectedPosition,
  positionRanges,
  onNotePlay,
  autoFitMobile,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomFretWidth, setZoomFretWidth] = useState<number | null>(null);

  // Auto-fit only on an explicit position change (or mount), never on
  // resize/scroll, so it doesn't fight a user's manual scroll/zoom mid-session.
  useEffect(() => {
    const container = containerRef.current;
    if (!autoFitMobile || positionRanges.length === 0 || !container) {
      setZoomFretWidth(null);
      return;
    }
    const range = positionRanges[0];
    const spanFrets = range.hi - range.lo + 1;
    const available = container.clientWidth - STRING_LABEL_WIDTH - 8;
    const fitted = Math.floor(available / spanFrets);
    setZoomFretWidth(Math.max(MIN_ZOOM_FRET_WIDTH, Math.min(FRET_WIDTH, fitted)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPosition, autoFitMobile]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || positionRanges.length === 0) return;
    const fw = zoomFretWidth ?? FRET_WIDTH;
    container.scrollLeft = Math.max(0, positionRanges[0].lo * fw - 8);
  }, [zoomFretWidth, positionRanges]);

  const fretWidth = zoomFretWidth ?? FRET_WIDTH;
  const numStrings = fretboard.length;
  const numFrets = fretboard[0]?.length ?? 0;
  const boardWidth = STRING_LABEL_WIDTH + fretWidth * numFrets;
  const boardHeight = TOP_PADDING + BOTTOM_PADDING + STRING_GAP * (numStrings - 1);

  const stringY = (stringIndex: number) =>
    TOP_PADDING + (numStrings - 1 - stringIndex) * STRING_GAP;
  const fretX = (fret: number) => STRING_LABEL_WIDTH + fret * fretWidth + fretWidth / 2;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-x-auto overflow-y-hidden bg-white dark:bg-black"
    >
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
              style={{ width: fretWidth }}
            >
              {fret}
            </div>
          ))}
        </div>

        <svg width={boardWidth} height={boardHeight} role="img" aria-label="Fretboard">
          {selectedPosition !== "all" &&
            positionRanges.map((range, i) => (
              <rect
                key={`band-${i}`}
                x={STRING_LABEL_WIDTH + range.lo * fretWidth}
                y={0}
                width={(range.hi - range.lo + 1) * fretWidth}
                height={boardHeight}
                className="fill-foreground/[0.06]"
              />
            ))}

          {Array.from({ length: numFrets }, (_, fret) => (
            <line
              key={`fretline-${fret}`}
              x1={STRING_LABEL_WIDTH + fret * fretWidth}
              x2={STRING_LABEL_WIDTH + fret * fretWidth}
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
              const dimmed =
                selectedPosition !== "all" &&
                !note.isRoot &&
                !note.positions?.includes(selectedPosition);
              return (
                <g
                  key={`note-${stringIndex}-${note.fret}`}
                  onClick={() => onNotePlay(note)}
                  className="cursor-pointer"
                  style={{ opacity: dimmed ? 0.28 : 1, transition: "opacity 0.2s ease" }}
                >
                  <circle cx={fretX(note.fret)} cy={stringY(stringIndex)} r={TOUCH_RADIUS} fill="transparent" />
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
