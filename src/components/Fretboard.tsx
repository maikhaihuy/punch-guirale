"use client";

import { memo, useEffect, useRef, useState } from "react";

import type { SelectedPosition } from "@/components/KeyModeBar";
import type { FretNote } from "@/lib/theory";

type Props = {
  fretboard: FretNote[][]; // [stringIndex][fret], stringIndex 0 = low E .. 5 = high E
  displayMode: "note" | "degree";
  selectedPosition: SelectedPosition;
  positionRanges: Array<{ lo: number; hi: number }>; // absolute fret ranges for selectedPosition, empty when "all"
  onNotePlay: (note: FretNote) => void;
  autoFitMobile: boolean;
  highlightTriad: boolean;
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
const TRIAD_RING_RADIUS = 18;

// Standard guitar fret-position inlays: single dot at these frets, double
// dot (the octave markers) at 12 and 24. Purely a wayfinding overlay -
// independent of the current scale/root/position selection.
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
  dimmed: boolean;
  showTriadRing: boolean;
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
  dimmed,
  showTriadRing,
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
      style={{ opacity: dimmed ? 0.28 : 1, transition: "opacity 0.2s ease" }}
    >
      <circle cx={cx} cy={cy} r={TOUCH_RADIUS} fill="transparent" />
      {showTriadRing && <circle cx={cx} cy={cy} r={TRIAD_RING_RADIUS} className="fret-note--triad" />}
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
  selectedPosition,
  positionRanges,
  onNotePlay,
  autoFitMobile,
  highlightTriad,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomFretWidth, setZoomFretWidth] = useState<number | null>(null);
  const [hoveredNoteName, setHoveredNoteName] = useState<string | null>(null);

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
    <div ref={containerRef} className="flex-1 overflow-x-auto overflow-y-hidden bg-surface">
      <div style={{ width: boardWidth, minWidth: boardWidth }}>
        <div
          className="sticky top-0 z-10 flex border-b border-black/10 bg-surface/95 backdrop-blur-sm dark:border-white/10"
          style={{ width: boardWidth }}
        >
          <div style={{ width: STRING_LABEL_WIDTH }} />
          {Array.from({ length: numFrets }, (_, fret) => (
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
          {selectedPosition !== "all" &&
            positionRanges.map((range, i) => (
              <rect
                key={`band-${i}`}
                x={STRING_LABEL_WIDTH + range.lo * fretWidth}
                y={0}
                width={(range.hi - range.lo + 1) * fretWidth}
                height={boardHeight}
                className="fill-text/6"
              />
            ))}

          {Object.entries(FRET_MARKERS).map(([fretStr, count]) => {
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

          {Array.from({ length: numFrets }, (_, fret) => (
            <line
              key={`fretline-${fret}`}
              x1={STRING_LABEL_WIDTH + fret * fretWidth}
              x2={STRING_LABEL_WIDTH + fret * fretWidth}
              y1={TOP_PADDING - 8}
              y2={boardHeight - BOTTOM_PADDING + 8}
              stroke="currentColor"
              strokeWidth={fret === 0 ? 4 : 1}
              className="text-text/20"
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
                className="text-text/30"
              />
              <text
                x={STRING_LABEL_WIDTH / 2}
                y={stringY(stringIndex)}
                dominantBaseline="middle"
                textAnchor="middle"
                className="fill-text-muted text-[11px] font-medium"
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
              const showTriadRing = highlightTriad && !!note.isTriadTone && !note.isRoot;
              const isEcho = note.name === hoveredNoteName;
              return (
                <FretboardNote
                  key={`note-${stringIndex}-${note.fret}`}
                  note={note}
                  cx={fretX(note.fret)}
                  cy={stringY(stringIndex)}
                  displayMode={displayMode}
                  label={label}
                  dimmed={dimmed}
                  showTriadRing={showTriadRing}
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
  );
}
