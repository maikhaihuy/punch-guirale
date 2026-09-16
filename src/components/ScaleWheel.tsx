"use client";

import { useEffect, useRef, useState } from "react";

import type { ScaleFamily } from "@/lib/scales";
import {
  CHROMATIC,
  getChordSymbol,
  getChromaticDegreeLabel,
  getDiatonicDegrees,
  getIllustrativeRomanNumeral,
  getScaleNoteNames,
  getWholeHalfPattern,
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
// responsively, same trick used for any fixed-viewBox SVG. Exactly two
// rings: the outer ring pairs each note with its chromatic degree label,
// the inner ring carries the whole/half-step arcs plus (for 7-degree
// families) the roman-numeral/chord-symbol - matching
// scale_wheel_concentric_rings.html's two-ring layout.
const SIZE = 320;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 122; // note + degree label, stacked together
const INNER_RADIUS = 68; // W/H arcs + roman-numeral/chord-symbol
const DOT_RADIUS = 17;
// Keeps adjacent touch circles clear of each other at OUTER_RADIUS (chord
// between neighboring wedge centers is ~63 viewBox units), while still
// scaling up to a real tap target at the wheel's minimum rendered width.
const TOUCH_RADIUS = 27;
const HUB_RADIUS = 28;
const HUB_TOUCH_RADIUS = 36;

// Below this rendered pixel width there isn't room to keep the degree
// label and inner ring (arcs + roman-numeral/chord-symbol) legible -
// they're hidden entirely (falling back to the note ring + center hub
// only) rather than shrinking text past legibility (see design.md
// Decision 7).
const MIN_RINGS_WIDTH = 200;

// Chromatic order, fixed regardless of root (the wheel never rotates - see
// design.md Decision 3). Index 0 (C) sits at 12 o'clock; index increases
// clockwise, 30 degrees per slice.
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

// Midpoint angle between two wedge indices, taking the short way around
// (in-scale gaps never exceed a handful of semitones, so this is always
// the visually-correct arc midpoint, not the long way around the circle).
function midpointAngle(fromIndex: number, toIndex: number): number {
  const from = angleForIndex(fromIndex);
  let to = angleForIndex(toIndex);
  if (to < from) to += 2 * Math.PI;
  return (from + to) / 2;
}

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
  // the full ring set rather than flashing the degraded state.
  const showEnrichmentRings = renderedWidth === 0 || renderedWidth >= MIN_RINGS_WIDTH;

  const rootIdx = CHROMATIC.indexOf(root);
  const scaleNotes = new Set(getScaleNoteNames(root, family, modeId));
  // Diatonic triads (and therefore true roman-numeral/chord-symbol
  // quality) only generalize to 7-note families - same gate used for the
  // Degrees row and the fretboard's triad ring (see design.md Decision 2).
  // Non-7-degree families still get an inner-ring label, just an
  // illustrative scale-position roman numeral instead (no chord letter,
  // no quality) - see getIllustrativeRomanNumeral's doc comment.
  const hasRealTriads = family.degreeCount === 7;

  // Ascending scale-degree order for any degreeCount - valid here since we
  // only read .noteName/.romanNumeral/.quality/.degreeLabel per degree,
  // same reasoning ScaleDashboard's Degrees row already relies on for
  // non-7-note families.
  const degrees = getDiatonicDegrees(root, family, modeId);
  const gaps = getWholeHalfPattern(family, modeId);

  const innerInfoByNote = new Map<NoteName, { primary: string; secondary?: string }>();
  for (const degree of degrees) {
    innerInfoByNote.set(
      degree.noteName,
      hasRealTriads
        ? { primary: degree.romanNumeral, secondary: getChordSymbol(degree.noteName, degree.quality) }
        : { primary: getIllustrativeRomanNumeral(degree.degreeLabel) },
    );
  }

  const arcs = degrees.map((degree, i) => {
    const next = degrees[(i + 1) % degrees.length];
    const fromIndex = CHROMATIC.indexOf(degree.noteName);
    const toIndex = CHROMATIC.indexOf(next.noteName);
    return { fromIndex, toIndex, gapSemitones: ((toIndex - fromIndex) % 12 + 12) % 12, label: gaps[i] };
  });

  return (
    <div ref={wrapperRef} className="h-auto w-full max-w-96 min-w-40 shrink-0">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Scale wheel" className="h-auto w-full">
        {showEnrichmentRings &&
          arcs.map((arc, i) => {
            const from = pointAt(INNER_RADIUS, arc.fromIndex);
            const to = pointAt(INNER_RADIUS, arc.toIndex);
            const midAngle = midpointAngle(arc.fromIndex, arc.toIndex);
            const mid = {
              x: round(CENTER + INNER_RADIUS * Math.cos(midAngle)),
              y: round(CENTER + INNER_RADIUS * Math.sin(midAngle)),
            };
            const largeArc = arc.gapSemitones > 6 ? 1 : 0;
            return (
              <g key={`arc-${i}`}>
                <path
                  d={`M ${from.x} ${from.y} A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArc} 1 ${to.x} ${to.y}`}
                  className="fill-none stroke-accent/50"
                  strokeWidth={1.5}
                />
                <text
                  x={mid.x}
                  y={mid.y}
                  dominantBaseline="middle"
                  textAnchor="middle"
                  className="fill-text-muted text-[9px] font-semibold tabular-nums"
                >
                  {arc.label}
                </text>
              </g>
            );
          })}

        {showEnrichmentRings &&
          CHROMATIC.map((note, index) => {
            const inner = innerInfoByNote.get(note);
            if (!inner) return null;
            const innerPoint = pointAt(INNER_RADIUS, index);
            return (
              <g key={`inner-${note}`}>
                <circle cx={innerPoint.x} cy={innerPoint.y} r={14} className="fill-bg stroke-text/10" />
                <text
                  x={innerPoint.x}
                  y={innerPoint.y}
                  dominantBaseline="middle"
                  textAnchor="middle"
                  className="fill-text-muted text-[9px] font-medium"
                >
                  {inner.secondary ? (
                    <>
                      <tspan x={innerPoint.x} dy="-0.55em">
                        {inner.primary}
                      </tspan>
                      <tspan x={innerPoint.x} dy="1.1em">
                        {inner.secondary}
                      </tspan>
                    </>
                  ) : (
                    inner.primary
                  )}
                </text>
              </g>
            );
          })}

        {CHROMATIC.map((note, index) => {
          const inScale = scaleNotes.has(note);
          const isRoot = note === root;
          const { x, y } = pointAt(OUTER_RADIUS, index);
          const degreeLabel = getChromaticDegreeLabel(index - rootIdx).join("/");

          // Same filled-root / outlined-others convention as Fretboard's
          // note dots (see design.md Decision 2/3).
          const dotClassName = isRoot ? "fill-text stroke-text" : "fill-surface stroke-text/70";
          const noteClassName = [isRoot ? "fill-bg" : "fill-text", "text-[11px] font-semibold font-display"].join(
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
              {showEnrichmentRings ? (
                <text x={x} y={y} dominantBaseline="middle" textAnchor="middle">
                  <tspan x={x} dy="-0.3em" className={noteClassName}>
                    {note}
                  </tspan>
                  <tspan
                    x={x}
                    dy="1.05em"
                    className={[
                      isRoot ? "fill-bg" : "fill-text-muted",
                      "text-[8px] font-medium tabular-nums",
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

        <g
          onPointerDown={() => onRootChange(randomRoot())}
          className="cursor-pointer"
          role="button"
          aria-label="Randomize root note"
        >
          <circle cx={CENTER} cy={CENTER} r={HUB_TOUCH_RADIUS} fill="transparent" />
          <circle cx={CENTER} cy={CENTER} r={HUB_RADIUS} className="fill-accent" />
          <text x={CENTER} y={CENTER} dominantBaseline="middle" textAnchor="middle" className="text-[16px]">
            🎲
          </text>
        </g>
      </svg>
    </div>
  );
}
