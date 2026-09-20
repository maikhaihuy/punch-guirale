"use client";

import { useEffect, useRef, useState } from "react";

import type { ScaleFamily } from "@/lib/scales";
import {
  CHROMATIC,
  getChromaticDegreeLabel,
  getScaleNoteNames,
  randomRoot,
  type NoteName,
} from "@/lib/theory";

type Props = {
  root: NoteName;
  onRootChange: (root: NoteName) => void;
  family: ScaleFamily;
  modeId: string;
};

// viewBox is fixed; the wrapping element controls the rendered size
// responsively, same trick used for any fixed-viewBox SVG. One ring of 12
// notes, each paired with its chromatic degree label, with a closed polygon
// joining the in-scale notes so the scale's shape reads at a glance. Roman
// numerals, chords, and whole/half-step gaps live in the Degrees row and the
// scale info table, not here.
const SIZE = 320;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 128;
// Neighboring note centers are 2 * OUTER_RADIUS * sin(15deg) ~= 66 apart, so
// DOT_RADIUS (dot diameter 52) leaves a small gap and TOUCH_RADIUS stays
// under half the spacing so adjacent touch circles never overlap.
const DOT_RADIUS = 26;
const TOUCH_RADIUS = 31;
const HUB_RADIUS = 34;
const HUB_TOUCH_RADIUS = 42;

// Below this rendered pixel width there isn't room to keep the degree label
// legible, so it's hidden (falling back to the note name only) rather than
// shrinking text past legibility (see design.md Decision 7 of
// enrich-scale-wheel). The connecting lines aren't text and stay.
const MIN_DEGREE_LABEL_WIDTH = 200;

// Chromatic order, fixed regardless of root (the wheel never rotates - see
// enrich-scale-wheel's design.md Decision 3). Index 0 (C) sits at 12 o'clock;
// index increases clockwise, 30 degrees per slice.
function angleForIndex(index: number): number {
  return ((-90 + index * 30) * Math.PI) / 180;
}

// Rounded to 2dp: Math.cos/Math.sin can differ in their last bit between
// the server and client JS engines for the same input, which otherwise
// produces a hydration mismatch on these SVG coordinates (React compares
// the exact string). Full float precision buys nothing visually at this
// element size anyway.
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function pointAt(radius: number, index: number): { x: number; y: number } {
  const theta = angleForIndex(index);
  return { x: round(CENTER + radius * Math.cos(theta)), y: round(CENTER + radius * Math.sin(theta)) };
}

// The closed scale polygon: one vertex per in-scale note, at the point of
// that note's circle edge facing the wheel's center, joined to the next
// vertex by a straight edge (last back to first). A polygon through the dot
// centers would be hidden under the opaque dots at every vertex and read as
// loose segments hanging off the circles; with the vertices on the circles'
// inner edges, the edges meet each other in plain sight and never cross a
// note's label.
const VERTEX_RADIUS = OUTER_RADIUS - DOT_RADIUS;

export function ScaleWheel({ root, onRootChange, family, modeId }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [renderedWidth, setRenderedWidth] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setRenderedWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Before the first measurement (renderedWidth === 0), default to showing
  // the degree labels rather than flashing the degraded state.
  const showDegreeLabels = renderedWidth === 0 || renderedWidth >= MIN_DEGREE_LABEL_WIDTH;

  const rootIdx = CHROMATIC.indexOf(root);
  // In ascending scale order starting at the root, so consecutive entries are
  // adjacent scale degrees and the polygon below closes last -> first.
  const scaleNoteNames = getScaleNoteNames(root, family, modeId);
  const scaleNotes = new Set(scaleNoteNames);
  const scalePolygonPoints = scaleNoteNames
    .map((note) => pointAt(VERTEX_RADIUS, CHROMATIC.indexOf(note)))
    .map(({ x, y }) => `${x},${y}`)
    .join(" ");

  return (
    <div ref={wrapperRef} className="mx-auto h-auto w-full max-w-96 min-w-40">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Scale wheel" className="h-auto w-full">
        {CHROMATIC.map((note, index) => {
          const inScale = scaleNotes.has(note);
          const isRoot = note === root;
          const { x, y } = pointAt(OUTER_RADIUS, index);
          const degreeLabel = getChromaticDegreeLabel(index - rootIdx).join("/");

          // Same filled-root / outlined-others convention as Fretboard's
          // note dots (see enrich-scale-wheel's design.md Decision 2/3).
          const dotClassName = isRoot ? "fill-text stroke-text" : "fill-surface stroke-text/70";
          const noteClassName = [isRoot ? "fill-bg" : "fill-text", "text-[15px] font-semibold font-display"].join(
            " ",
          );

          return (
            <g
              key={note}
              onPointerDown={() => onRootChange(note)}
              className={`cursor-pointer transition-opacity ${inScale ? "" : "opacity-30"}`}
            >
              <circle cx={x} cy={y} r={TOUCH_RADIUS} fill="transparent" />
              <circle cx={x} cy={y} r={DOT_RADIUS} className={dotClassName} strokeWidth={2} />
              {showDegreeLabels ? (
                <text x={x} y={y} dominantBaseline="middle" textAnchor="middle">
                  <tspan x={x} dy="-0.3em" className={noteClassName}>
                    {note}
                  </tspan>
                  <tspan
                    x={x}
                    dy="1.15em"
                    className={[
                      isRoot ? "fill-bg" : "fill-text-muted",
                      "text-[10px] font-medium tabular-nums",
                    ].join(" ")}
                  >
                    {degreeLabel}
                  </tspan>
                </text>
              ) : (
                <text x={x} y={y} dominantBaseline="middle" textAnchor="middle" className={noteClassName}>
                  {note}
                </text>
              )}
            </g>
          );
        })}

        {/* Vertices sit on the dots' inner edges, so this never covers a
            label; it never intercepts a tap meant for a note or the hub. */}
        <polygon
          points={scalePolygonPoints}
          className="pointer-events-none fill-none stroke-accent/80"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        <g
          onPointerDown={() => onRootChange(randomRoot())}
          className="cursor-pointer"
          role="button"
          aria-label="Randomize root note"
        >
          <circle cx={CENTER} cy={CENTER} r={HUB_TOUCH_RADIUS} fill="transparent" />
          <circle cx={CENTER} cy={CENTER} r={HUB_RADIUS} className="fill-accent" />
          <text x={CENTER} y={CENTER} dominantBaseline="middle" textAnchor="middle" className="text-[20px]">
            🎲
          </text>
        </g>
      </svg>
    </div>
  );
}
