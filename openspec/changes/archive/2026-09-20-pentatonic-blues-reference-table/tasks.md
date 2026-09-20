## 0. Preconditions

- [x] 0.1 `enrich-scale-wheel` is archived (2026-09-20) and its
      requirements are in the main `scale-dashboard` spec, which this
      change's delta assumes (see design.md Decision 7).

## 1. Blues Major data fix (`scales.ts`)

- [x] 1.1 Change `BLUE_MAJOR_INTERVALS` to `[0, 2, 3, 4, 7, 9]` with the
      comment `// 1 2 b3 3 5 6`. Keep the mode's `intervalPattern`
      override and `degreeCount: 6`.
- [x] 1.2 Update `scales.test.ts` (`computes the Blue family's Blues Minor
      and Blues Major modes` and `uses a mode's own interval-pattern
      override…`) to expect `[0, 2, 3, 4, 7, 9]` and 6 notes for
      `blues-major`; add the relative-major check (Blues Major at C and
      Blues Minor at A produce the same pitch-class set).
- [x] 1.3 In the Major Pentatonic family, change the `displayName`s of the
      `blues-minor` and `blues-major` modes to "Man Gong" and "Ritusen"
      (matching the Minor Pentatonic family). Leave their ids alone, so
      URLs and the existing rotation test keep working.
- [x] 1.4 `pnpm test` passes.

## 2. Reference data module (`src/lib/scaleReference.ts`)

- [x] 2.1 Define `ChordSpec` / `ReferenceRow` types and the four reference
      tables exactly as in `specs/scale-degree-reference/spec.md`
      (offsets, roman numerals, names, blue-note flags, chord specs,
      hints). Roman numerals with alternatives (`v / V`, `v7 / V7`) stay
      as single strings.
- [x] 2.2 Implement `getScaleReference(intervals)` matching by the joined
      interval pattern; return `undefined` for any other pattern.
- [x] 2.3 Implement a row-rendering helper that, given a root, a row, and
      the mode's intervals, returns: slot degree label (reuse
      `degreeLabelForSemitone`'s table — export it or use
      `getChromaticDegreeLabel(...)[0]`; do not add a second table),
      would-be note name, interval name (`getIntervalName`), `skipped`
      (offset not in intervals), and the transposed chord strings
      (including `/bass` for slash chords).
- [x] 2.4 Add `scaleReference.test.ts`: (a) all four patterns resolve, incl.
      the Major Pentatonic family's fifth rotation → Minor Pentatonic and
      both Blue modes; (b) Egyptian and Major return `undefined`; (c) row
      counts (7/7/8/8) and skipped offsets (Minor Pentatonic `2, 8`);
      (d) at the sheet's root (C / A) every row's chord strings equal the
      sheet; (e) transposition: Major Pentatonic at D gives `F#m, F#m7,
      D/F#` for offset 4; (f) only the two blue-note rows are flagged.

## 3. Info table rendering (`ScaleInfoTable.tsx`)

- [x] 3.1 Refactor to build a row view-model per case (reference scale /
      7-degree / other), then render uniformly. 7-degree families gain a
      Roman column (6 columns: Formula, Notes, Intervals, Roman, Degree,
      Chords) whose value is `getDiatonicDegrees()`'s `romanNumeral`, the
      same value the Degrees row shows; nothing else about their rows
      changes.
- [x] 3.2 Reference case: 6 columns (Formula, Notes, Intervals, Roman,
      Degree, Chords) and one row per reference slot in ascending offset
      order, replacing the family-id/mode-id chord-table special-casing
      and the `MINOR_/MAJOR_PENTATONIC_CHORD_SUFFIXES` usage.
- [x] 3.3 Skipped rows: row at reduced opacity; note struck through
      followed by a `Skip` text badge; Formula/Intervals/Roman/Degree/
      Chords still shown; must not be selectable/clickable.
- [x] 3.4a Put the new UI strings (`Roman` header, `Skip`, `Blue note`,
      `Rarely used`, `Avoid <note> when soloing`, `Turnaround`) in one
      small key→string map instead of inlining them in JSX (design.md
      Decision 10). No i18n library.
- [x] 3.4 Hints in the Chords cell: `Rarely used` (no chords), chords +
      `Avoid <note> when soloing`, chords + `Turnaround`.
- [x] 3.5 `Blue note` badge beside the degree name for flagged slots.
- [x] 3.6 Check the dimmed text's contrast against the theme tokens in
      light and dark; raise opacity or use a token if it falls below
      readable contrast (the `Skip` badge itself stays full contrast).
- [x] 3.7 Verify at ~375px width that the table scrolls horizontally via
      the existing wrapper instead of wrapping cells.

## 4. Scale Wheel inner-ring removal (`ScaleWheel.tsx`)

- [x] 4.1 Delete the W/H arc block, the inner-circle block,
      `INNER_RADIUS`, `hasRealTriads`, `innerInfoByNote`, `arcs`,
      `midpointAngle`, and the now-unused imports (`getChordSymbol`,
      `getIllustrativeRomanNumeral`, `getWholeHalfPattern`,
      `getDiatonicDegrees` if unused); update the header comment (the
      wheel now has one ring, not two).
- [x] 4.2 Rename `showEnrichmentRings` → `showDegreeLabels` and
      `MIN_RINGS_WIDTH` accordingly; keep the 200px threshold; it now
      gates only the degree label under each note.
- [x] 4.3 Delete `getChordSymbol` and `getIllustrativeRomanNumeral` from
      `theory.ts` (no remaining callers — grep to confirm).
- [x] 4.4 Confirm unchanged: click any wedge re-roots (including dimmed
      ones), root styling, dimming, center hub randomizes. Confirmed by
      code reading (handlers untouched); not tapped in a browser.
- [x] 4.5 Enlarge the notes: raise `DOT_RADIUS`, `TOUCH_RADIUS`, the
      note/degree font sizes, and (if room) `OUTER_RADIUS`/`HUB_RADIUS`,
      keeping neighboring dots from touching (neighbor spacing is
      `2·R·sin(15°)`) and the `viewBox` `SIZE` unchanged. Tune by eye at
      the wheel's maximum and minimum widths; re-check that
      `MIN_RINGS_WIDTH` still marks where degree labels stop being
      legible. Kept at 200px: at that width the degree label renders at
      ~6px (10px x 200/320), already larger than the ~5px the old 8px
      label had at the same threshold; below it, labels hide (checked in
      a 215px-wide frame).
- [x] 4.6 Draw the scale connecting lines: a closed polygon/line set
      through the in-scale dot centers in scale order (last → first
      closing), before the dots in paint order, `pointer-events: none`,
      no labels, styled like the old arcs (`stroke-accent/50`). Verify
      out-of-scale (dimmed) notes have no line, and that lines are still
      drawn below the degree-label minimum width.
- [x] 4.7 Verify a tap on a dot or the hub where a line crosses it still
      re-roots/randomizes, and that a 3-semitone-gap scale's longest line
      (e.g. Minor Pentatonic) clears the hub. Line has `pointer-events:
      none` (code); clearance checked in screenshots. Not tapped in a
      browser.

## 5. Cleanup and docs

- [x] 5.1 Delete `MINOR_PENTATONIC_CHORD_SUFFIXES` and
      `MAJOR_PENTATONIC_CHORD_SUFFIXES` from `chords.ts` (grep for
      remaining users first).
- [x] 5.2 Rewrite the stale comment at the top of `ScaleDashboard`
      (`isSevenDegree` gating W/H) so it says only the roman numeral is
      gated; W/H renders for every family.
- [x] 5.3 Update `CLAUDE.md`: the Blue family (a `blue` family, not a
      Minor Pentatonic variant), the info-table reference data, and
      that a vitest suite (`pnpm test`) exists.

## 6. Verification

- [x] 6.1 `pnpm test` (37 tests) and `pnpm build` are clean. **`pnpm lint`
      could not run**: ESLint 10 fails loading `eslint-plugin-react`
      (`contextOrFilename.getFilename is not a function`) on the untouched
      baseline too, so it is a pre-existing toolchain break, not fixed
      here; `tsc --noEmit` is clean.
- [x] 6.2 Check each of the four scales at its sheet root (Major
      Pentatonic and Major Blues at C; Minor Pentatonic and Minor Blues
      at A) against the reference sheet — roman numerals, degree names,
      chords, `Skip` rows, `Blue note` badges. Chords/names/badges are
      asserted at the sheet roots in `scaleReference.test.ts` and
      `ScaleInfoTable.test.tsx`; visually checked in the browser
      (headless screenshots, root C) for Minor Pentatonic, Major Blues,
      and Minor Blues.
- [x] 6.3 Change root on a reference scale (e.g. Major Pentatonic to D)
      and confirm the table transposes, including `D/F#`. Covered by
      render + data tests at root D (`F#m, F#m7, D/F#`); the root was not
      changed by clicking in the browser.
- [x] 6.4 Open `/blue/blues-major` and confirm 6 notes (`1 2 ♭3 3 5 6`) on
      the fretboard, wheel, Degrees row, and table; confirm the Degrees
      row shows `W`/`H`/`3` gap indicators for Pentatonic and Blue.
- [x] 6.5 Confirm a non-reference mode (e.g. Egyptian) still renders the
      reduced 3-column table with no skipped rows, and a 7-degree family
      (e.g. Major) shows the new Roman column matching the Degrees row's
      numerals (`I ii iii IV V vi vii°`), with its other columns
      unchanged.
- [x] 6.6 Confirm the wheel shows no inner ring for a 7-degree and a
      non-7-degree family, shows enlarged notes with connecting lines
      between in-scale notes only, and drops degree labels (but keeps the
      lines) below the minimum width.
- [x] 6.7 Confirm the Major Pentatonic family's mode selector now reads
      "Man Gong" and "Ritusen" where it read "Blues Minor"/"Blues Major",
      and `/major-pentatonic/blues-minor` still resolves.

## 7. Egyptian, Man Gong, Ritusen reference (added after the first apply)

- [x] 7.1 In `scaleReference.ts`, add `EGYPTIAN_ROWS` (`0,2,5,7,10`),
      `MAN_GONG_ROWS` (`0,3,5,8,10`), and `RITUSEN_ROWS` (`0,2,5,7,9`)
      exactly as in `specs/scale-degree-reference/spec.md` (5 rows each, no
      hints, no blue notes) and register their patterns in
      `REFERENCE_BY_PATTERN`.
- [x] 7.2 Merge the two sheet additions into the existing tables: `Am11`
      on Major Pentatonic offset `9`; `Gsus4` on Minor Pentatonic offset
      `10`. Keep both tables' skipped rows.
- [x] 7.3 Update `scaleReference.test.ts`: every mode of both pentatonic
      families resolves and the shared-pattern modes return the same table;
      Egyptian/Man Gong/Ritusen chords and roman numerals at D/E/G match the
      sheet; each has 5 rows and none skipped; Major/Minor Pentatonic
      chords include the two additions; the "no reference" cases use a
      pattern that still has none (`0,1,5,7,8`, and Major).
- [x] 7.4 Update `ScaleInfoTable.test.tsx`: the reduced-3-column test can no
      longer use Egyptian; render a hand-built 5-note family with pattern
      `0,1,5,7,8` instead. Add render cases for Egyptian, Man Gong, Ritusen
      (6 columns, 5 rows, no `Skip`).
- [x] 7.5 Update `CLAUDE.md` (four -> seven scales) and any stale comment
      naming Egyptian etc. as having no reference.
- [x] 7.6 `pnpm test` (46 tests), `pnpm build`, `tsc --noEmit` clean;
      looked at Egyptian and Man Gong in the browser (headless screenshot,
      root C); Ritusen is covered by render + data tests only. Original
      wording: look at
      `/major-pentatonic/egyptian`, `/minor-pentatonic/man-gong`, and
      `/major-pentatonic/blues-major` (Ritusen) in the browser.

## 8. One row path for the info table (refactor, no behavior change)

- [x] 8.1 Add `src/lib/scaleRows.ts` with `getScaleRows(root, family, modeId)`
      returning `{ rows, showDetail }`, where each row is the existing
      `ReferenceSlot` shape: reference rows when the pattern has reference
      data; otherwise, for 7-degree families, rows derived from
      `getDiatonicDegrees` (roman, `getDegreeFunctionName`, chords from
      the triad-quality table; never skipped or blue-note); otherwise
      Formula/Notes/Intervals-only rows with `showDetail: false`.
- [x] 8.2 Collapse `buildRows`/`TableRow` in `ScaleInfoTable.tsx` into a
      call to `getScaleRows`; render `ReferenceSlot` fields directly
      (resolve the hint label at render time). Rendered output stays
      identical, so the existing `ScaleInfoTable.test.tsx` cases must pass
      unchanged.
- [x] 8.3 Add `scaleRows.test.ts`: 7-degree Major at C (offsets, romans
      `I ii iii IV V vi vii°`, names incl. `Leading Tone`, chords); Dorian's
      7th degree is `Subtonic`; a reference pattern passes through with
      skipped rows; a custom 5-note family falls back with
      `showDetail: false`.
- [x] 8.4 Update `CLAUDE.md`'s reference-data note to mention `scaleRows.ts`.
- [x] 8.5 `pnpm test`, `pnpm build`, `tsc --noEmit` clean; the Major and
      Minor Pentatonic pages look the same as before the refactor.

## 9. Skipped slots for Egyptian/Man Gong/Ritusen, strikethrough, closed wheel outline

- [x] 9.1 In `scaleReference.ts`, make `roman` optional on `ReferenceRow`
      and `ReferenceSlot`; add the `not-applicable` hint. Extend
      `EGYPTIAN_ROWS` (skipped `4` Mediant, `9` Submediant), `MAN_GONG_ROWS`
      (skipped `2` Supertonic, `7` Dominant), and `RITUSEN_ROWS` (skipped
      `4` Mediant, `11` Leading Tone) to 7 rows each in ascending offset
      order, the new rows with no roman, no chords, hint `not-applicable`.
      Keep Major/Minor Pentatonic's existing skipped rows unchanged.
- [x] 9.2 In `scaleReferenceLabels.ts`, add `notApplicable: "N/A"` and the
      `not-applicable` hint label `N/A`.
- [x] 9.3 In `ScaleInfoTable.tsx`, strike through (and dim) the text of the
      Formula, Notes, Intervals, Roman (`N/A` when absent), and Degree
      cells of a skipped row, wrapping only the text so the `Skip` badge and
      the Chords cell stay unstruck.
- [x] 9.4 Update tests: Egyptian/Man Gong/Ritusen now have 7 rows and the
      skipped offsets above; no-chords/`not-applicable` invariant; render
      tests assert strikethrough on cells 0-4 of skipped rows and none in
      the Chords cell or in in-scale rows; Egyptian Mediant row reads
      `3`/`F#`/`N/A`/`Mediant`/`N/A`.
- [x] 9.5 Rework the wheel outline in `ScaleWheel.tsx`: replace the
      through-the-centers polygon with a `<polygon>` whose one vertex per
      in-scale note lies on that note's circle edge facing the wheel
      center (radius `OUTER_RADIUS - DOT_RADIUS`), straight edges only,
      `pointer-events: none`, no fill, same accent stroke. (An
      edge-to-edge-with-arcs version was built first and rejected: the
      vertices weren't joined to each other.)
- [x] 9.6 Confirm the outline is closed and continuous for a 5-note, a
      6-note, and a 7-note scale, doesn't cover labels, and is unchanged
      at small widths (screenshots).
- [x] 9.7 Update `CLAUDE.md`, run `pnpm test`, `pnpm build`, `tsc --noEmit`,
      and look at the pages in the browser.
