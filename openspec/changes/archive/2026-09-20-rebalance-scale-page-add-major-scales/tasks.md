## 1. Scale families (scale-data-model)

- [x] 1.1 In `src/lib/scales.ts`, add `HARMONIC_MAJOR_INTERVALS = [0, 2, 4, 5, 7, 8, 11]` and `MELODIC_MAJOR_INTERVALS = [0, 2, 4, 5, 7, 8, 10]`
- [x] 1.2 Add the `harmonic-major` family (7 modes, rotation 0–6, ids per design.md Decision 2) to `SCALE_FAMILIES` right after `harmonic-minor`
- [x] 1.3 Add the `melodic-major` family (7 modes, ids per design.md Decision 2) right after `melodic-minor`
- [x] 1.4 In `src/lib/scales.test.ts`, add tests: Harmonic Major on C → `C D E F G G# B`; Melodic Major on C → `C D E F G G# A#`; each family has 7 modes with distinct patterns; Harmonic Major `dorian-b5` = `0,2,3,5,6,9,10`; Melodic Major `melodic-minor` = `0,2,3,5,7,9,11`; Melodic Minor `mixolydian-b6` pattern equals Melodic Major's first mode

## 2. Reference data (scale-degree-reference)

- [x] 2.1 In `src/lib/scaleReference.ts`, add `HARMONIC_MAJOR_ROWS` (offsets 0,2,4,5,7,8,11) with roman numerals, degree names, and chords exactly as in the `scale-degree-reference` delta spec (`bVI+` → `aug` / `maj7#5`; `vii°` → `dim` / `dim7`; use `Leading Tone`)
- [x] 2.2 Add `MELODIC_MAJOR_ROWS` (offsets 0,2,4,5,7,8,10) likewise (`iii°` → `dim`; `bVII` → `""` / `maj7`; keep `Fm7` and `A#maj7` as specified — see design.md Risks)
- [x] 2.3 Register both in `REFERENCE_BY_PATTERN` under `"0,2,4,5,7,8,11"` and `"0,2,4,5,7,8,10"`; update the file's header comment (now nine patterns, no longer only pentatonic/blues)
- [x] 2.4 In `src/lib/scaleReference.test.ts`, add tests: both patterns return 7 rows with none skipped, no blue notes, no hints; C-rooted chord spot checks from the delta spec; transposition to D; Melodic Minor's `mixolydian-b6` receives the Melodic Major reference; Harmonic Minor's own mode still has none (existing test stays green)

## 3. Info table rows (scale-info-table)

- [x] 3.1 In `src/lib/scaleRows.ts`, confirm no logic change is needed (reference before derivation) and remove the leftover `console.log("getScaleRows", …)`
- [x] 3.2 In `src/lib/scaleRows.test.ts` / `src/components/ScaleInfoTable.test.tsx`, add tests: Harmonic Major first mode → 7 rows with reference Roman/Degree/Chords (e.g. `bVI+` / `Submediant` / `G#aug, G#maj7#5`); Harmonic Major `dorian-b5` → 7 derived rows; Melodic Major first mode → 6 columns, 7 rows

## 4. Dashboard layout (scale-dashboard, scale-info-table)

- [x] 4.1 In `ScaleDashboard.tsx`, replace the wheel/table `flex flex-wrap` section with a grid: one column below `md`, `md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]` at `md`+, both cells `min-w-0`, per design.md Decision 1
- [x] 4.2 In `ScaleWheel.tsx`, change the wrapper from `w-full max-w-96 min-w-40 shrink-0` to a width that fits its grid cell (`w-full max-w-96 min-w-40 mx-auto`); leave the `ResizeObserver` / `MIN_DEGREE_LABEL_WIDTH` logic untouched
- [x] 4.3 In `ScaleInfoTable.tsx`, keep the `overflow-x-auto` wrapper and make sure it can shrink inside the grid cell (`min-w-0`)
- [x] 4.4 In `ScaleDashboard.tsx`, restructure the Degrees/switch section as a grid: stacked below `md`, `md:grid-cols-[minmax(0,8fr)_minmax(max-content,2fr)]` at `md`+, Degrees pills keep wrapping inside their cell but grow to fill it (`flex-auto` wrappers, `flex-1` buttons), switch aligned to the end of its cell
- [x] 4.5 Add/adjust a component test asserting the Degrees row and the switch render as siblings in one grid container and the wheel and table as siblings in another (structure only — no DOM layout in `renderToStaticMarkup`)

## 5. Verify and document

- [x] 5.1 Run `pnpm test`, `pnpm lint`, and `pnpm build`; all pass (test: 70 pass, build: pass; lint crashes in `eslint-plugin-react` on the untouched baseline too — ESLint 10 incompatibility, unrelated to this change)
- [x] 5.2 Run `pnpm dev` and check `/harmonic-major/harmonic-major`, `/melodic-major/melodic-major`, `/melodic-minor/mixolydian-b6`, and one non-reference family (e.g. `/major/ionian`) at 375, 768, 1024, and 1440px: wheel and table on one row from 768px, table scrolls locally, Degrees ≈ 4/5 with the switch fully visible, no page-level horizontal scroll, wheel keeps its degree labels at 768px
- [x] 5.3 Update `CLAUDE.md`: list the two new families in the `SCALE_FAMILIES` sentence and change "seven interval patterns" / the reference-data description in the Scale reference data bullet to nine patterns (including 7-degree ones)
