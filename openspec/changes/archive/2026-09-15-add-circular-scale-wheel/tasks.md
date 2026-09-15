## 1. Wheel geometry and static rendering

- [x] 1.1 Create `src/components/ScaleWheel.tsx` accepting `root`,
      `onRootChange`, `family`, `modeId` props (mirroring
      `ScaleDashboard.tsx`'s existing prop shapes for these).
- [x] 1.2 Render a 12-wedge SVG outer ring in fixed `CHROMATIC` order
      (C at 12 o'clock, clockwise, 30° per wedge), each wedge as a
      `<g>` with note-name `<text>`, following `Fretboard.tsx`'s
      existing `<g>` + oversized transparent touch-target `<circle>`
      pattern for the clickable area.
- [x] 1.3 Wire each wedge's pointer handler to call `onRootChange(note)`,
      matching today's root-selection behavior.
- [x] 1.4 Keep the existing randomize button working, positioned next to
      the wheel.

## 2. Scale-membership highlighting

- [x] 2.1 Compute the current scale's note set via
      `getScaleNoteNames(root, family, modeId)` inside `ScaleWheel`.
- [x] 2.2 Apply full opacity to wedges whose note is in that set, and
      reduced opacity to wedges whose note is not — dimming is opacity
      only, no `pointer-events` change, so dimmed wedges stay clickable
      and re-root the scale when selected.
- [x] 2.3 Give the root wedge a distinct fill/stroke treatment from other
      in-scale wedges (mirroring the fretboard's filled-root /
      outlined-others convention).

## 3. Inner ring: degree label and triad roman numeral

- [x] 3.1 Compute `getDiatonicDegrees(root, family, modeId)` inside
      `ScaleWheel` and gate all inner-ring rendering on
      `family.degreeCount === 7`.
- [x] 3.2 For each in-scale wedge (7-degree families only), render a
      smaller-radius inner-ring `<text>` showing `degreeLabel` (e.g.
      `b3`) and `romanNumeral` (e.g. `ii`, `vii°`) at the same angle as
      its outer-ring note.
- [x] 3.3 Render no inner ring at all for non-7-degree families (e.g.
      Pentatonic) — outer ring only.

## 4. Integrate into ScaleDashboard

- [x] 4.1 Replace the root `PillGroup` block in `ScaleDashboard.tsx`
      with `<ScaleWheel root={root} onRootChange={onRootChange}
      family={family} modeId={modeId} />`, keeping the randomize button.
- [x] 4.2 Leave the Degrees `PillGroup` (`selectedTriadDegree` /
      `onSelectedTriadDegreeChange`) and the Note/Degree `Switch`
      untouched, laid out below or alongside the wheel.
- [x] 4.3 Confirm `ScalePage.tsx` needs no prop/wiring changes — `root`,
      `family`, `modeId`, `onRootChange` already flow through unchanged.

## 5. Styling and responsiveness

- [x] 5.1 Size the wheel and its touch targets so all 12 wedges stay
      tappable at typical dashboard widths, including mobile.
- [x] 5.2 Match visual language (colors/opacity tokens) to
      `pill-group.tsx`'s existing active/inactive styling for
      consistency with the rest of the dashboard.

## 6. Manual verification

- [x] 6.1 Run `pnpm dev` and verify root selection, randomize, and
      dimming behavior across at least one 7-degree family (e.g. Major)
      and one 5-degree family (e.g. Minor Pentatonic).
- [x] 6.2 Verify a dimmed (out-of-scale) wedge, when clicked, becomes the
      new root and the wheel recomputes correctly.
- [x] 6.3 Verify inner-ring degree/roman-numeral labels render for
      7-degree families and do not render for Pentatonic families.
- [x] 6.4 Verify the Degrees row and triad-ring highlighting on the
      Fretboard still work unchanged.
- [x] 6.5 Run `pnpm lint`. Pre-existing failure on `main` (confirmed via
      `git stash`, unrelated to this change): ESLint 10 +
      `eslint-plugin-react` 7.37.5 throw `contextOrFilename.getFilename
      is not a function` while loading the `react/display-name` rule,
      before linting any file content. Not fixed here — out of scope,
      not introduced by this change.
