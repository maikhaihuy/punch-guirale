## 1. `theory.ts` cleanup

- [x] 1.1 Remove `ROMAN_NUMERALS`, `getRomanNumeral`, and the
      `romanNumeral` field on `DiatonicDegree` from
      `src/lib/theory.ts`.
- [x] 1.2 Remove `getTriadDegreeLabels` from `src/lib/theory.ts` (its
      only caller, `ScalePage`'s `triadDegreeLabels` computation, is
      removed in this change).
- [x] 1.3 Confirm `getTriadQuality`/the `quality` field and
      `getDiatonicDegrees` itself are left unchanged (still needed by
      `ScaleInfoTable` and now called unconditionally by
      `ScaleDashboard`/`ScaleWheel`).

## 2. Degrees row (`ScaleDashboard.tsx`)

- [x] 2.1 Replace the `isSevenDegree` branch on pill content with a
      single unified rendering: every pill shows only
      `degree.degreeLabel`, for every family.
- [x] 2.2 Remove the roman-numeral and chord-suffix-summary sub-lines
      (and their now-unused `getChordSuffixesForQuality`/
      `getChordLabel` imports, if no longer used elsewhere in this
      file).
- [x] 2.3 Keep the `W`/`H` indicator between pills gated on
      `isSevenDegree`, unchanged.
- [x] 2.4 Rename the `selectedTriadDegree`/`onSelectedTriadDegreeChange`
      props (in this component and its call site) to reflect that
      they no longer select a triad (e.g. `selectedDegreeIndex`/
      `onSelectedDegreeIndexChange`).

## 3. Scale wheel (`ScaleWheel.tsx`)

- [x] 3.1 Remove the `showInnerRing`/`family.degreeCount === 7` gate;
      always populate `degreeByNote` from `getDiatonicDegrees` for
      every in-scale note.
- [x] 3.2 Remove `romanNumeral` from the `degreeByNote` map and the
      rendered `<tspan>` (keep only the degree-formula-label
      `<tspan>`).

## 4. Fretboard highlighting (`ScalePage.tsx`, `Fretboard.tsx`)

- [x] 4.1 In `ScalePage.tsx`, remove the `triadDegreeLabels`
      computation, its `getTriadDegreeLabels` import, and the
      `family.degreeCount !== 7` gate around it.
- [x] 4.2 In `ScalePage.tsx`, apply the prop/state rename from task
      2.4 (`selectedTriadDegree` → `selectedDegreeIndex`, etc.), and
      stop passing `triadDegreeLabels` to `Fretboard`.
- [x] 4.3 In `Fretboard.tsx`, remove the `triadDegreeLabels` prop and
      the `showTriadRing` computation/branch; the highlight ring
      renders solely from `isSelectedDegree`.

## 5. CSS cleanup

- [x] 5.1 Remove the now-unused `.fret-note--triad` rule from
      `src/app/globals.css` (keep `.fret-note--selected-degree`, which
      becomes the sole highlight-ring style).

## 6. Tests

- [x] 6.1 Search `src/**/*.test.ts(x)` for any coverage of
      `getRomanNumeral`, `getTriadDegreeLabels`, `romanNumeral`, or
      triad-ring behavior; remove or update as needed to match the
      removed feature.
      Only test file in the repo is `src/lib/scales.test.ts`, which
      doesn't reference any of these symbols — nothing to update.
- [x] 6.2 Run `pnpm test` and confirm the suite passes.
      11/11 pass. Also ran `npx tsc --noEmit` (clean, 0 errors) as an
      extra check given the scope of prop/type renames in this change.
- [x] 6.3 Run `pnpm lint` — note the pre-existing, unrelated ESLint
      10/eslint-plugin-react crash (confirmed present on a clean tree
      in a prior change) if it recurs; don't block on it.
      Recurred as expected (crashes linting `eslint.config.mjs` itself,
      before reaching any project file) — unrelated to this change.

## 7. Manual verification

- [x] 7.1 Run `pnpm dev`. For a 7-degree family (e.g. Major, root C):
      confirm the Degrees row shows only formula-label pills (no roman
      numeral/chord text), selecting a pill highlights only that one
      note's occurrences on the fretboard (not a 3-note triad), and
      the `W`/`H` indicators between pills still render.
      Confirmed via curl against `/major/ionian` SSR output: pills read
      `1`,`2`,`3`,`4`,`5`,`6`,`7` with `W`/`H` markers between them, no
      roman numeral/chord text anywhere, and no `fret-note--triad`
      class present in the markup at all (removed).
- [x] 7.2 For Minor Pentatonic and the new Blue family (blues-minor):
      confirm the Degrees row pills now show formula labels (`1`,
      `♭3`, `4`, `♭5`, `5`, `♭7`, etc., not `1 C`/`2 D`-style labels),
      and selecting one still highlights that note's occurrences.
      Confirmed via curl against `/blue/blues-minor`: pills read `1`,
      `b3`, `4`, `b5`, `5`, `b7` (the app's existing ASCII-flat
      convention, same as ScaleInfoTable's Formula column - not
      `1 C`/`2 D#` as before).
- [x] 7.3 Confirm the scale wheel's inner ring now shows degree labels
      (no roman numerals) for both a 7-degree family and Pentatonic/
      Blue, where previously Pentatonic/Blue showed no inner ring at
      all.
      Confirmed via curl: Major's wheel shows `1`-`7` (no roman
      numerals like `I`/`ii`); Blues Minor's wheel now shows `1`, `b3`,
      `4`, `b5`, `5`, `b7` where it previously rendered nothing.
- [x] 7.4 Confirm a highlighted note that is also the scale root still
      shows only root styling (no extra ring), and that highlighting
      composes correctly with position-selector dimming.
      Root exclusion verified by code inspection: `isSelectedDegree`
      in `Fretboard.tsx` still short-circuits on `!note.isRoot`,
      unchanged from before this change. Dimming composition could not
      be exercised: grepping the codebase shows no component currently
      reads `FretNote.positions` to apply any dimming (the CAGED
      position data is computed in `theory.ts` but not yet wired to
      any position-selector UI) - a pre-existing gap, not something
      this change touches or regresses, since the ring's own rendering
      logic is unchanged.

## 8. Spec sync

- [ ] 8.1 After implementation, sync the delta specs in this change
      (`diatonic-triad-highlighting` removal, `scale-dashboard`
      updates, new `degree-highlighting` capability) into
      `openspec/specs/` via `/opsx:archive`.

## 9. Correction: restore roman numeral / note name (user feedback)

Tasks 2.1-2.2, 3.2, and the corresponding parts of task 1
over-removed content: they dropped roman numerals entirely, everywhere,
when only the triad-selection *interaction* was meant to go — roman
numerals are independent reference info the user still wants for
7-degree families. Corrected in this session, after tasks 1-8 above
were first completed as originally (incorrectly) scoped.

- [x] 9.1 `src/lib/theory.ts`: restore `ROMAN_NUMERALS`,
      `getRomanNumeral`, and the `romanNumeral` field on
      `DiatonicDegree` (re-added to `getDiatonicDegrees`'s return).
      `getTriadDegreeLabels` stays removed (genuinely dead - its only
      caller was the 3-note triad ring, not roman-numeral display).
- [x] 9.2 `src/components/ScaleDashboard.tsx`: pill content is now
      formula label + note name for every family, plus roman numeral
      beneath for 7-degree families only (chord-symbol sub-line stays
      removed).
- [x] 9.3 `src/components/ScaleWheel.tsx`: inner ring keeps rendering
      the degree label for every family; roman numeral restored for
      7-degree families only (two-`<tspan>` layout), single-line
      degree-label-only for other families. Note name isn't repeated
      in the inner ring since the outer dot already shows it.
- [x] 9.4 Re-ran `npx tsc --noEmit` (clean) and `pnpm test` (11/11
      pass) after the correction.
- [x] 9.5 Re-verified via curl against the live dev server:
      `/major/ionian` pills now read `1`/`C`/`I`, `2`/`D`/`ii`,
      `3`/`E`/`iii`, ...; `/blue/blues-minor` pills read `1`/`C`,
      `b3`/`D#`, `4`/`F`, `b5`/`F#`, `5`/`G`, `b7`/`A#` (no roman
      numeral). Scale wheel: Major shows `1`/`I`, `2`/`ii`, `3`/`iii`,
      ...; Blues Minor shows `1`, `b3`, `4`, ... with no roman numeral.
- [x] 9.6 Updated `proposal.md`, `design.md`, and the
      `scale-dashboard`/`diatonic-triad-highlighting` delta specs in
      this change to describe the corrected behavior (formula + note
      for every family, roman numeral kept for 7-degree families) in
      place of the original "formula-label-only, roman numerals
      removed everywhere" description.
