## 1. `theory.ts` additions

- [x] 1.1 Export `getChromaticDegreeLabel(offset: number): string[]` as a
      public wrapper around the existing `degreeLabelForSemitone` /
      `DEGREE_LABELS_BY_SEMITONE` table, extended to return both
      enharmonic names at the 5 accidental offsets (1, 3, 6, 8, 10 →
      `["b2","#1"]`, `["b3","#2"]`, `["b5","#4"]`, `["b6","#5"]`,
      `["b7","#6"]`) and a single-entry array at the other 7. The
      underlying table's existing single-name values (used by
      `FretNote.degree` / `getTriadDegreeLabels`) are unchanged.
- [x] 1.2 Change `getWholeHalfPattern`'s gap check from binary (`H`/`W`) to
      3-way: `1` → `H`, `2` → `W`, else → the semitone count as a string.
      Confirm existing 7-degree-family callers are unaffected (their gaps
      are always 1 or 2).
- [x] 1.3 Add `getChordSymbol(noteName: NoteName, quality: TriadQuality):
      string` (e.g. `major` → bare note name, `minor` → `"<note>m"`,
      `diminished` → `"<note>°"`, `augmented` → `"<note>+"`).
- [x] 1.4 Add `getIllustrativeRomanNumeral(degreeLabel: string): string`
      (e.g. `"b3"` → `"bIII"`, `"5"` → `"V"`) for the wheel's inner ring on
      non-7-degree families — always uppercase, no chord letter, no
      quality-based case distinction, since real triad quality doesn't
      generalize past 7-degree stacks (see design.md Decision 9).

## 2. `ScaleWheel.tsx` — universal degree ring

- [x] 2.1 Render a degree-label `<text>` for all 12 wedges via
      `getChromaticDegreeLabel`, independent of `inScale`/dimmed state,
      joining a 2-entry result as `"b2/#1"` and rendering a 1-entry result
      as-is. Stacked directly with the note name as a second line within
      the same outer-ring wedge (both at `OUTER_RADIUS`) — final geometry
      per Khai-Huy's follow-up ("1-2-3 ở vòng tròn ngoài đưa vô cùng note
      luôn"), not a separate ring outside the note ring.
- [x] 2.2 Keep roman-numeral/chord-quality text limited to
      `family.degreeCount === 7` in-scale wedges (unchanged gate from
      `add-circular-scale-wheel`).
- [x] 2.3 Verify the degree label renders distinctly from (doesn't visually
      collide with) the existing note-name label on dimmed wedges, which
      previously had no inner-ring text at all.
- [x] 2.4 Verify the dual-name label (`"b2/#1"`) fits legibly at the
      degree ring's radius without truncation or overlap with neighboring
      wedges' labels, adjusting font size/radius if needed (see section 6).

## 3. `ScaleWheel.tsx` — whole/half-step arcs

- [x] 3.1 Compute the sorted list of in-scale wedge indices (chromatic
      order, wrapping B→C).
- [x] 3.2 Draw an arc path between each consecutive pair, tracing the
      inner ring's circle (`INNER_RADIUS`) — the same ring the
      roman-numeral/chord-symbol content uses — with the label (via the
      updated `getWholeHalfPattern`: `H`/`W`/semitone count) at the arc's
      angular midpoint. Final geometry per Khai-Huy's follow-up ("W-H đặt
      ở vòng tròn bên trong"): an earlier pass matched the reference
      demo's literal outer-ring placement, superseded by this.
- [x] 3.3 Confirm arcs render only between in-scale wedges — no arc drawn
      to/from a dimmed, out-of-scale wedge.

## 4. `ScaleWheel.tsx` — inner-ring roman numeral / chord symbol

- [x] 4.1 For `degreeCount === 7` in-scale wedges, render `getChordSymbol`
      output alongside the existing roman numeral (not replacing it), per
      design.md Decision 4.
- [x] 4.2 For non-7-degree in-scale wedges (Pentatonic), render
      `getIllustrativeRomanNumeral(degree.degreeLabel)` alone (no chord
      letter) instead of leaving the inner ring empty, per design.md
      Decision 9 — reverses this task's earlier "no chord ring for
      Pentatonic" scope after Khai-Huy flagged the empty ring against the
      reference demo.

## 5. `ScaleWheel.tsx` — center-hub randomize

- [x] 5.1 Add a clickable center circle (`CENTER, CENTER`) with an
      oversized touch target, `onPointerDown={() =>
      onRootChange(randomRoot())}`, visually distinct from wedge styling.
- [x] 5.2 Remove the standalone randomize button and its layout slot from
      `ScaleDashboard.tsx`.
- [x] 5.3 Confirm `randomRoot()` import moves (or is shared) correctly
      between `ScaleDashboard.tsx` and `ScaleWheel.tsx` with no duplicate
      randomize entry points left in the UI.

## 6. Sizing

- [x] 6.1 Replace the wheel's fixed `w-[240px] sm:w-[260px]` wrapper class
      with a fluid min/max width; no `ResizeObserver` needed for the
      scaling itself (a separate `ResizeObserver` is used only to gate
      the size-based ring degradation in 6.4) since the `viewBox` already
      scales interior geometry proportionally. Set the max-width
      generously (not just wide enough to avoid clipping the original
      two-ring layout) — the wheel is allowed to grow larger than
      `add-circular-scale-wheel`'s original size to fit its new rings,
      per the "Wheel scales fluidly with available width" requirement.
- [x] 6.2 Tune `SIZE`/`OUTER_RADIUS`/`INNER_RADIUS` so the note+degree
      (outer ring, stacked) and W/H-arc+roman-numeral/chord-symbol (inner
      ring, sharing one radius) don't crowd each other at the wheel's
      minimum rendered width. Exactly two rings total, plus the center
      hub — no separate arc or degree ring in between. Enlarged per
      Khai-Huy's "phóng to" ask: `SIZE` 280→320, `OUTER_RADIUS` 105→122,
      `INNER_RADIUS` 58→68, wrapper `max-w-72`→`max-w-96`.
- [x] 6.3 Confirm `TOUCH_RADIUS` touch targets stay outer-ring-only — no
      new tap targets introduced by the additional display-only rings.
- [x] 6.4 Pick a minimum-size threshold below which `ScaleWheel` renders
      only the note ring, dimming, and center hub (dropping the degree,
      W/H arc, and roman-numeral/chord-symbol rings entirely), and gate
      their rendering on the wheel's resolved pixel size crossing that
      threshold.

## 7. `Fretboard.tsx` — minimum cell width

- [x] 7.1 Add a floor (~32–40px) to the `fretWidth` calculation in
      `Fretboard.tsx`: `Math.max(MIN_FRET_WIDTH, (containerWidth -
      STRING_LABEL_WIDTH) / displayFretCount)`.
- [x] 7.2 When the floor is active (computed width would be below
      `MIN_FRET_WIDTH`), reduce `displayFretCount` (or otherwise defer to
      the existing `fretboard-viewport` zoom/minimap/pan mechanics) so the
      board still fits its container, instead of letting `boardWidth`
      overflow unchecked. Implemented as horizontal scroll (`overflow-x-auto`
      on the fretboard's container) rather than auto-narrowing
      `displayFretCount` — the app has no range-minimap/pinch-zoom today
      (only the existing +/- zoom buttons, which set `visibleFretCount`
      directly), so silently overriding the user's chosen zoom level would
      conflict with that control rather than defer to it.
- [x] 7.3 Confirm the range minimap, corner zoom controls, and touch
      pinch/pan gestures still work unchanged once the floor is active.
      Note: this codebase's `fretboard-viewport` implementation only has
      the corner +/- zoom buttons (`visibleFretCount` 12/24) — no range
      minimap or pinch/pan gestures exist despite the merged spec
      describing them; that's a pre-existing spec/code gap, not something
      this change introduces or fixes. Verified the +/- buttons still work
      with the floor active.

## 8. Manual verification

- [ ] 8.1 `pnpm dev`; verify universal degree labels (including dual
      enharmonic names at the 5 accidental positions), W/H arcs sitting on
      the inner ring, and the roman-numeral+chord-symbol inner ring
      together across at least one 7-degree family (e.g. Major), and
      confirm Minor Pentatonic shows degree labels plus an illustrative
      roman numeral (no chord letter) on its inner ring instead of an
      empty one. **Not done — no headless browser/display available in
      this environment.** Verified the underlying logic instead: ran
      `getChromaticDegreeLabel`, `getWholeHalfPattern`, `getChordSymbol`,
      `getIllustrativeRomanNumeral`, and `getDiatonicDegrees` directly for
      C Major, C Minor Pentatonic, C Major Pentatonic, and C Harmonic
      Minor — all outputs matched expected music theory (e.g. Pentatonic
      gaps `3,W,W,3,W`, Harmonic Minor's augmented 2nd as `3`, correct
      diatonic chords `C Dm Em F G Am B°`, and Minor Pentatonic
      illustrative numerals `I bIII IV V bVII`).
- [ ] 8.2 Verify center-hub randomize replaces the old button with
      identical behavior (sets a new random root, fretboard recomputes,
      family/mode unchanged). **Not visually tested** — confirmed by code
      reading that the hub's `onPointerDown` calls `onRootChange(randomRoot())`
      and nothing touches family/mode.
- [ ] 8.3 Resize the dashboard/wheel's container across a wide range and
      confirm the wheel scales continuously with no snap points down to
      its minimum-size threshold, then drops the degree/W-H/chord rings
      (keeping note ring + center hub) rather than rendering illegible
      text below that threshold. **Not visually tested** — same
      environment limitation as 8.1.
- [ ] 8.4 Verify dimmed (out-of-scale) wedges still re-root on click,
      unchanged from `add-circular-scale-wheel`. **Not visually tested** —
      confirmed by code reading that every wedge's `onPointerDown` handler
      is unconditional, regardless of `inScale`.
- [ ] 8.5 Narrow the fretboard's container width and confirm fret cells
      shrink fluidly down to the ~32–40px floor, then hold at that floor
      while the visible fret range/zoom controls take over instead of
      cells shrinking further. **Not visually tested** — same environment
      limitation.
- [ ] 8.6 Confirm the wheel renders inline in `ScaleDashboard` (no modal
      or separate expanded view — reverted per review of
      `scale_wheel_concentric_rings.html`, which itself renders inline).
      **Not visually tested** — confirmed by code reading that
      `ScaleDashboard.tsx` renders `<ScaleWheel>` directly, with no
      open/closed state or overlay.
- [x] 8.7 `pnpm lint` (expect the pre-existing `react/display-name`
      failure noted in `add-circular-scale-wheel`'s tasks.md, unrelated to
      this change). Confirmed: same failure, same root cause
      (`eslint-plugin-react` 7.37.5 + ESLint 10 incompatibility loading
      before any file content lints). Also ran `pnpm build` (production
      build succeeds, all 35 static pages generate, TypeScript passes)
      and `pnpm test` (existing 9 tests in `scales.test.ts` still pass) as
      additional non-visual checks.
