"use client";

import { Minus, Plus } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

import type { FretNote } from "@/lib/theory";

type Props = {
  fretboard: FretNote[][]; // [stringIndex][fret], stringIndex 0 = low E .. 5 = high E
  displayMode: "note" | "degree";
  onNotePlay: (note: FretNote) => void;
  selectedDegreeLabel: string | null;
  // Pitch class currently sounding from scale playback; echoed like a hover,
  // but a real hover/touch takes precedence while it is active.
  playingNoteName?: string | null;
};

const STRING_NAMES = ["E", "A", "D", "G", "B", "E"]; // low E to high E, matches OPEN_STRINGS order
const MIN_FRET = 1; // fret 0 (open string) is dropped from the grid entirely
const ZOOMED_IN_FRETS = 12;
const ZOOMED_OUT_FRETS = 24;
const STRING_LABEL_WIDTH = 28;
const STRING_GAP = 40;
const TOP_PADDING = 20;
const BOTTOM_PADDING = 20;
const DOT_RADIUS = 14;
const TOUCH_RADIUS = 22;
const DEGREE_HIGHLIGHT_RING_RADIUS = 18;
const FALLBACK_FRET_WIDTH = 52;
// Fret cells never shrink below this - once the container is too narrow to
// fit `displayFretCount` cells at this width, the board overflows its
// container and the user scrolls/zooms instead of cells getting smaller
// than a tap target (see fretboard-viewport's minimum fret cell width
// requirement).
const MIN_FRET_WIDTH = 36;

// Standard guitar fret-position inlays: single dot at these frets, double
// dot (the octave markers) at 12 and 24. Purely a wayfinding overlay -
// independent of the current scale or root.
const FRET_MARKERS: Record<number, 1 | 2> = {
  3: 1,
  5: 1,
  7: 1,
  9: 1,
  12: 2,
  15: 1,
  17: 1,
  19: 1,
  21: 1,
  24: 2,
};
const MARKER_RADIUS = 5;
const DOUBLE_MARKER_OFFSET = 16;

type FretboardNoteProps = {
  note: FretNote;
  cx: number;
  cy: number;
  label: string | undefined;
  displayMode: "note" | "degree";
  isSelectedDegree: boolean;
  isEcho: boolean;
  onPlay: () => void;
  onHoverChange: (name: string | null) => void;
};

// Active-press state lives here (not CSS `:hover`) so mouse and touch
// behave identically and the glow lands on the same press that triggers
// playback, per note-interaction-states. Hover/touch also drive
// `onHoverChange` so sibling same-pitch-class notes elsewhere on the
// fretboard can render the echo highlight, per pitch-echo-highlighting.
// `isHovering` (mouse-only) is what excludes *this* note from its own
// echo styling on hover, since `isEcho` alone would also be true for the
// note actually under the pointer (it trivially shares its own name).
const FretboardNote = memo(function FretboardNote({
  note,
  cx,
  cy,
  label,
  displayMode,
  isSelectedDegree,
  isEcho,
  onPlay,
  onHoverChange,
}: FretboardNoteProps) {
  const [active, setActive] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const clearInteraction = () => {
    setActive(false);
    setIsHovering(false);
    onHoverChange(null);
  };

  const dotClassName = [
    "fret-note",
    note.isRoot
      ? "fret-note--root fill-text stroke-text"
      : "fill-surface stroke-text/70",
    active && "fret-note--active",
    isEcho && !active && !isHovering && "fret-note--echo",
  ]
    .filter(Boolean)
    .join(" ");

  const labelClassName = [
    note.isRoot ? "fill-bg" : "fill-text",
    "text-[10px] font-semibold",
    displayMode === "note" ? "font-display" : "tabular-nums",
  ].join(" ");

  return (
    <g
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") {
          setIsHovering(true);
          onHoverChange(note.name);
        }
      }}
      onPointerDown={() => {
        setActive(true);
        onHoverChange(note.name);
        onPlay();
      }}
      onPointerUp={clearInteraction}
      onPointerLeave={clearInteraction}
      onPointerCancel={clearInteraction}
      className="cursor-pointer"
    >
      <circle cx={cx} cy={cy} r={TOUCH_RADIUS} fill="transparent" />
      {isSelectedDegree && (
        <circle
          cx={cx}
          cy={cy}
          r={DEGREE_HIGHLIGHT_RING_RADIUS}
          className="fret-note--selected-degree"
        />
      )}
      <circle cx={cx} cy={cy} r={DOT_RADIUS} className={dotClassName} strokeWidth={2} />
      <text x={cx} y={cy} dominantBaseline="middle" textAnchor="middle" className={labelClassName}>
        {label}
      </text>
    </g>
  );
});

export function Fretboard({
  fretboard,
  displayMode,
  onNotePlay,
  selectedDegreeLabel,
  playingNoteName = null,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleFretCount, setVisibleFretCount] = useState<number>(ZOOMED_IN_FRETS);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hoveredNoteName, setHoveredNoteName] = useState<string | null>(null);
  const echoNoteName = hoveredNoteName ?? playingNoteName;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const numStrings = fretboard.length;
  const totalFrets = fretboard[0]?.length ?? 0; // includes dropped fret 0
  const maxDisplayFrets = Math.max(0, totalFrets - MIN_FRET);
  const displayFretCount = Math.min(visibleFretCount, maxDisplayFrets);
  const fretWidth =
    containerWidth > 0
      ? Math.max(MIN_FRET_WIDTH, (containerWidth - STRING_LABEL_WIDTH) / displayFretCount)
      : FALLBACK_FRET_WIDTH;
  const boardWidth = STRING_LABEL_WIDTH + fretWidth * displayFretCount;
  const boardHeight = TOP_PADDING + BOTTOM_PADDING + STRING_GAP * (numStrings - 1);
  const maxVisibleFret = MIN_FRET + displayFretCount - 1;

  const stringY = (stringIndex: number) =>
    TOP_PADDING + (numStrings - 1 - stringIndex) * STRING_GAP;
  const fretX = (fret: number) => STRING_LABEL_WIDTH + (fret - MIN_FRET) * fretWidth + fretWidth / 2;
  const fretLeftX = (fret: number) => STRING_LABEL_WIDTH + (fret - MIN_FRET) * fretWidth;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <div ref={containerRef} className="overflow-x-auto overflow-y-hidden bg-surface">
          <div style={{ width: boardWidth }}>
            <div
              className="flex border-b border-black/10 bg-surface/95 dark:border-white/10"
              style={{ width: boardWidth }}
            >
              <div style={{ width: STRING_LABEL_WIDTH }} />
              {Array.from({ length: displayFretCount }, (_, i) => i + MIN_FRET).map((fret) => (
                <div
                  key={fret}
                  className="flex shrink-0 items-center justify-center text-xs font-medium tabular-nums text-text-muted"
                  style={{ width: fretWidth }}
                >
                  {fret}
                </div>
              ))}
            </div>

            <svg width={boardWidth} height={boardHeight} role="img" aria-label="Fretboard">
              {Object.entries(FRET_MARKERS)
                .filter(([fretStr]) => Number(fretStr) <= maxVisibleFret)
                .map(([fretStr, count]) => {
                  const fret = Number(fretStr);
                  const cx = fretX(fret);
                  const cy = boardHeight / 2;
                  if (count === 1) {
                    return <circle key={`marker-${fret}`} cx={cx} cy={cy} r={MARKER_RADIUS} className="fill-text-muted/40" />;
                  }
                  return (
                    <g key={`marker-${fret}`}>
                      <circle cx={cx} cy={cy - DOUBLE_MARKER_OFFSET} r={MARKER_RADIUS} className="fill-text-muted/40" />
                      <circle cx={cx} cy={cy + DOUBLE_MARKER_OFFSET} r={MARKER_RADIUS} className="fill-text-muted/40" />
                    </g>
                  );
                })}

              {Array.from({ length: displayFretCount }, (_, i) => i + MIN_FRET).map((fret) => (
                <line
                  key={`fretline-${fret}`}
                  x1={fretLeftX(fret)}
                  x2={fretLeftX(fret)}
                  y1={TOP_PADDING - 8}
                  y2={boardHeight - BOTTOM_PADDING + 8}
                  stroke="currentColor"
                  strokeWidth={1}
                  className="text-text/20"
                />
              ))}

              {STRING_NAMES.map((name, stringIndex) => {
                // Fret 0 (open string) isn't drawn as a numbered fret dot
                // anymore, but its note should stay reachable - the string
                // label itself doubles as the open-string "note", playable
                // whenever that open note is in the current scale.
                const openNote = fretboard[stringIndex]?.[0];
                const playable = !!openNote?.inScale;
                return (
                  <g key={`string-${stringIndex}`}>
                    <line
                      x1={STRING_LABEL_WIDTH}
                      x2={boardWidth}
                      y1={stringY(stringIndex)}
                      y2={stringY(stringIndex)}
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="text-text/30"
                    />
                    <text
                      x={STRING_LABEL_WIDTH / 2}
                      y={stringY(stringIndex)}
                      dominantBaseline="middle"
                      textAnchor="middle"
                      onPointerDown={playable ? () => onNotePlay(openNote) : undefined}
                      className={`text-[11px] font-medium ${
                        playable
                          ? "cursor-pointer fill-text hover:fill-accent"
                          : "fill-text-muted"
                      }`}
                    >
                      {name}
                    </text>
                  </g>
                );
              })}

              {fretboard.map((frets, stringIndex) =>
                frets.map((note) => {
                  if (!note.inScale || note.fret < MIN_FRET || note.fret > maxVisibleFret) return null;
                  const label = displayMode === "note" ? note.name : note.degree;
                  const isSelectedDegree =
                    selectedDegreeLabel !== null && note.degree === selectedDegreeLabel && !note.isRoot;
                  const isEcho = note.name === echoNoteName;
                  return (
                    <FretboardNote
                      key={`note-${stringIndex}-${note.fret}`}
                      note={note}
                      cx={fretX(note.fret)}
                      cy={stringY(stringIndex)}
                      displayMode={displayMode}
                      label={label}
                      isSelectedDegree={isSelectedDegree}
                      isEcho={isEcho}
                      onPlay={() => onNotePlay(note)}
                      onHoverChange={setHoveredNoteName}
                    />
                  );
                }),
              )}
            </svg>
          </div>
        </div>

        <div className="absolute right-2 bottom-2 flex flex-col overflow-hidden rounded-md border border-black/10 bg-surface shadow-sm dark:border-white/10">
          <button
            type="button"
            onClick={() => setVisibleFretCount(ZOOMED_IN_FRETS)}
            disabled={visibleFretCount === ZOOMED_IN_FRETS}
            aria-label="Zoom in"
            className="flex size-7 items-center justify-center text-text-muted hover:bg-black/5 hover:text-text disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-white/10"
          >
            <Plus className="size-4" aria-hidden />
          </button>
          <div className="h-px bg-black/10 dark:bg-white/10" />
          <button
            type="button"
            onClick={() => setVisibleFretCount(ZOOMED_OUT_FRETS)}
            disabled={visibleFretCount === ZOOMED_OUT_FRETS}
            aria-label="Zoom out"
            className="flex size-7 items-center justify-center text-text-muted hover:bg-black/5 hover:text-text disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-white/10"
          >
            <Minus className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
