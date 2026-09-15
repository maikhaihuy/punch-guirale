## Context

`ScaleDashboard.tsx` currently renders root selection as a flat `PillGroup`
of the 12 chromatic pitch classes (`CHROMATIC` from `theory.ts`), with no
visual link to which of those 12 notes are actually in the current
scale/mode — that fact only shows up separately, in the Degrees row below,
keyed by scale degree (1–7) rather than by pitch class. This change merges
"pick a root" and "see which pitch classes are in-scale" into one circular
control. `Fretboard.tsx` already renders its interactive note dots as SVG
(`<g>` wrapping a transparent oversized touch-target `<circle>`, a visible
dot, and a `<text>` label, with `onPointerDown`/`onPointerEnter` handlers —
see `Fretboard.tsx` lines ~106-138), which this design follows for
consistency rather than introducing a second interaction pattern.

## Goals / Non-Goals

**Goals:**
- Replace the root pill row with a 12-slice circular wheel: click/tap a
  pitch class to set it as root, same as today.
- Visually distinguish in-scale vs. out-of-scale pitch classes (dimmed, not
  hidden) and the root note itself, live-updating as root/family/mode
  change.
- Surface degree label + triad roman numeral (for 7-degree families) next
  to each in-scale note, reusing `getDiatonicDegrees()`'s existing output.
- Keep the wheel a compact dashboard control, not a second practice
  surface — `Fretboard.tsx` remains the primary interaction area.

**Non-Goals:**
- Triad-degree selection (the existing "Degrees" `PillGroup` /
  `selectedTriadDegree`) does not move onto the wheel in this change. It
  stays exactly as-is. A future change may move that interaction onto the
  fretboard itself (for improvisation use cases) — not designed here.
- No new music-theory computation. `CHROMATIC`, `getScaleNoteNames`,
  `getDiatonicDegrees`, `randomRoot` (all in `theory.ts`) already provide
  everything needed; nothing here touches `theory.ts` or `scales.ts`.
- No keyboard/focus-ring interaction model beyond what `Fretboard.tsx`'s
  note dots already do (pointer-only) — matching existing precedent rather
  than inventing new a11y treatment for this one control.

## Decisions

1. **New component `src/components/ScaleWheel.tsx`**, replacing only the
   root `PillGroup` block inside `ScaleDashboard.tsx`. Props: `root`,
   `onRootChange`, `family`, `modeId` — the component calls
   `getScaleNoteNames()` and `getDiatonicDegrees()` itself, mirroring how
   `ScaleDashboard` already calls `getDiatonicDegrees()` inline rather than
   receiving it as a prop. The Degrees `PillGroup`, Note/Degree `Switch`,
   and randomize button stay in `ScaleDashboard.tsx` unchanged, laid out
   alongside the new wheel.
   - Alternative considered: compute derived data in `ScaleDashboard` and
     pass it down. Rejected — no other consumer needs it, and it would
     just add prop plumbing without benefit.

2. **SVG with `<g>`-wrapped wedges, following `Fretboard.tsx`'s existing
   note-dot pattern**, not absolutely-positioned HTML buttons and not
   `role="button"`/keyboard handling. Each of the 12 outer-ring wedges is a
   `<g onPointerDown={() => onRootChange(note)}>` containing a transparent
   oversized touch-target shape (same technique as `Fretboard`'s
   `TOUCH_RADIUS` circle) plus the visible note glyph/label.
   - Rationale: this is an established, working interaction pattern already
     in the codebase for clickable musical notes; reusing it keeps the app
     internally consistent and avoids a second competing technique (CSS
     trig-positioned buttons) for what is conceptually the same kind of
     control.
   - Alternative considered: HTML buttons positioned via `left`/`top`
     computed from trig — rejected for the reason above, and because arcs/
     rings for the inner-ring degree info are natively simpler in SVG.

3. **Fixed chromatic orientation, not root-locked-at-top.** The 12 wedges
   sit at fixed angles in `CHROMATIC` order (C at 12 o'clock, clockwise),
   regardless of the selected root. The root wedge is highlighted wherever
   it lands; the wheel itself never rotates.
   - Rationale: avoids rotation-animation complexity and disorientation on
     every root change; matches the familiar "chromatic clock face" mental
     model.
   - Trade-off accepted: users who expect "root always on top" (like a
     compass-style relative view) don't get that. Revisit only if this
     becomes real user feedback — noted in Risks below, not solved here.

4. **Scale-membership dimming is a plain array-membership check in the
   component** (`getScaleNoteNames(root, family, modeId).includes(note)`),
   applied as a CSS opacity class — not a new `theory.ts` function. This
   still respects "components never recompute scale membership themselves"
   (CLAUDE.md) because the membership set itself still comes entirely from
   `theory.ts`; the component only filters against it, the same way
   `Fretboard` already renders from a precomputed `inScale` flag.
   - Dimmed notes stay fully interactive — dimming is `opacity` only, no
     `pointer-events` or disabled state, so clicking a dimmed note re-roots
     the scale on it (per explicit product decision).
   - The root note gets a distinct fill/stroke treatment from other
     in-scale notes, mirroring the existing "root filled, others outlined"
     language already used on the fretboard (`scale-fretboard` spec,
     "Root note is visually distinct").

5. **Inner ring is display-only and gated on `family.degreeCount === 7`.**
   For 7-degree families, each in-scale wedge gets a second, smaller-radius
   label showing `degreeLabel` (e.g. `b3`) and `romanNumeral` (e.g. `ii`,
   `vii°`) from `getDiatonicDegrees()`. For 5-degree (Pentatonic) families,
   the inner ring does not render at all in this first version.
   - Rationale: matches the existing gating pattern used for the Degrees
     row (`scale-dashboard` spec, "Degrees row hidden for non-7-degree
     families") and for triad highlighting (`diatonic-triad-highlighting`
     — triads don't generalize to 5-note scales). Keeping it binary
     (render fully or not at all) avoids a half-featured degree-label-only
     inner ring for Pentatonic that would need its own design pass.

## Risks / Trade-offs

- [12 wedges is a tight touch target on mobile widths] → Mitigation: size
  the oversized transparent touch-target shape per wedge the same way
  `Fretboard.tsx` does for fret dots, and give the whole wheel a minimum
  diameter so wedge arc-width stays tappable at typical dashboard widths.
- [Outer + inner ring + labels risks visual clutter in a compact dashboard
  control] → Mitigation: inner ring only exists for 7-degree families, kept
  to short single-token labels (`ii`, `b3`), small type scale.
- [No automated tests in this repo] → Mitigation: none available/expected
  (CLAUDE.md: "There is no test suite configured in this repo"); verify
  manually via `pnpm dev` across the shipped families/modes before this is
  considered done.
- [Fixed chromatic orientation doesn't rotate root-to-top] → Mitigation:
  accepted trade-off (see Decision 3); not a defect, revisit only on actual
  user feedback.

## Migration Plan

N/A — presentational-only change, no data model, no persisted state, no
routing changes.

## Open Questions

- None blocking. Exact wheel pixel diameter / responsive breakpoints are
  an implementation detail to tune during build, not a decision needed
  up front.
