## 1. Chord vocabulary refactor (suffix-based, single source of truth)

- [x] 1.1 In `src/lib/chords.ts`, rename `CHORD_VOCABULARY` → `CHORD_SUFFIXES` and change the bare-major entry from `"maj"` to `""`, so it reads `major: ["", "6", "maj7", "add9"]`.
- [x] 1.2 Rename `getChordsForQuality` → `getChordSuffixesForQuality` (same signature/behavior, just returns suffixes now).
- [x] 1.3 Add `getChordLabel(suffix: string): string` — returns `"maj"` for `""`, otherwise returns the suffix unchanged.
- [x] 1.4 Add `getConcreteChordName(noteName: NoteName, suffix: string): string` — returns `` `${noteName}${suffix}` ``.
- [x] 1.5 Update `src/components/ScaleDashboard.tsx`'s Degrees-row chord line (from the `enhance-degree-chord-display` change) to `getChordSuffixesForQuality(degree.quality).map(getChordLabel).join(" · ")` and update its import accordingly, so the rendered output (`maj · 6 · maj7 · add9`, etc.) is unchanged.

## 2. Interval name and degree-function-name data

- [x] 2.1 Create `src/lib/scaleTerms.ts` with a 12-entry `INTERVAL_NAMES_BY_SEMITONE` array (`"Unison"`, `"Minor second"`, `"Major second"`, `"Minor third"`, `"Major third"`, `"Perfect fourth"`, `"Diminished fifth"`, `"Perfect fifth"`, `"Minor sixth"`, `"Major sixth"`, `"Minor seventh"`, `"Major seventh"`) and a `getIntervalName(semitoneOffset: number): string` lookup (wrap offset into 0-11, same pattern as `theory.ts`'s `degreeLabelForSemitone`).
- [x] 2.2 In the same file, add a 6-entry `DEGREE_FUNCTION_NAMES` array (`"Tonic"`, `"Supertonic"`, `"Mediant"`, `"Subdominant"`, `"Dominant"`, `"Submediant"`, covering degree positions 0-5) and change `getDegreeFunctionName` to `getDegreeFunctionName(degreeIndex: number, semitoneOffsetFromRoot: number): string`: for `degreeIndex === 6`, return `"Leading Tone"` when `semitoneOffsetFromRoot === 11`, else `"Subtonic"`; for `degreeIndex` 0-5, return `DEGREE_FUNCTION_NAMES[degreeIndex]` as before.
- [x] 2.3 Update `src/components/ScaleInfoTable.tsx`'s call site to pass the degree's own semitone offset (`semitoneOffsets[i]`, already computed for the Intervals column) as `getDegreeFunctionName`'s second argument.

## 3. ScaleInfoTable component

- [x] 3.1 Create `src/components/ScaleInfoTable.tsx` taking `root`, `family`, `modeId` props (same shape as `ScaleWheel`'s props).
- [x] 3.2 For `degreeCount === 7`, compute `getDiatonicDegrees(root, family, modeId)` and render a `<table>` with header row (Formula, Notes, Intervals, Degree, Chords) and one `<tr>` per degree: Formula = `degree.degreeLabel`, Notes = `degree.noteName`, Intervals = `getIntervalName(<that degree's semitone offset from root>)`, Degree = `getDegreeFunctionName(degree.index)`, Chords = `getChordSuffixesForQuality(degree.quality).map((suffix) => getConcreteChordName(degree.noteName, suffix)).join(", ")`.
- [x] 3.3 Wrap the `<table>` in a container with `overflow-x-auto` so it scrolls instead of breaking layout on narrow viewports.
- [x] 3.4 Style the table to match the app's existing text/color tokens (`text-text`, `text-text-muted`, borders consistent with other components) — no new design tokens.
- [x] 3.5 Change the `degreeCount !== 7` early-return to per-column gating instead: always render the Formula/Notes/Intervals `<th>`s and `<td>`s (using `getDiatonicDegrees`, valid for any `degreeCount` — same as the Degrees row already relies on); only render the Degree and Chords `<th>`s/`<td>`s when `family.degreeCount === 7`. Build the header list (`HEADERS`) conditionally to match.

## 3a. Minor Pentatonic base-mode chord table

- [x] 3a.1 In `src/lib/chords.ts`, add `export const MINOR_PENTATONIC_CHORD_SUFFIXES = ["m", "", "m7", "m7", "5"] as const;` (5-entry, degree-position-indexed, confirmed against C and D roots by the user — see design.md).
- [x] 3a.2 In `src/components/ScaleInfoTable.tsx`, compute `const isMinorPentatonicBase = family.id === "minor-pentatonic" && modeId === "minor-pentatonic";` and a combined `const showChordsColumn = isSevenDegree || isMinorPentatonicBase;` Use `showChordsColumn` (not just `isSevenDegree`) to gate the Chords `<th>`/header entry and `<td>`. The Degree column stays gated on `isSevenDegree` alone (unchanged).
- [x] 3a.3 In the Chords `<td>`, branch: for `isSevenDegree`, keep the existing `getChordSuffixesForQuality(degree.quality)...join(", ")` logic; for `isMinorPentatonicBase` (and not seven-degree), render `getConcreteChordName(degree.noteName, MINOR_PENTATONIC_CHORD_SUFFIXES[degree.index])` (single chord, no join).

## 3b. Major Pentatonic base-mode chord table

- [x] 3b.1 In `src/lib/chords.ts`, add `export const MAJOR_PENTATONIC_CHORD_SUFFIXES = ["", "m7", "m7", "sus4", "m"] as const;` (5-entry, degree-position-indexed, confirmed against root D by the user — see design.md).
- [x] 3b.2 In `src/components/ScaleInfoTable.tsx`, generalize the Minor-Pentatonic-only branch into a single `pentatonicChordSuffixes` lookup: `null` by default, `MINOR_PENTATONIC_CHORD_SUFFIXES` when `family.id === "minor-pentatonic" && modeId === "minor-pentatonic"`, `MAJOR_PENTATONIC_CHORD_SUFFIXES` when `family.id === "major-pentatonic" && modeId === "major-pentatonic"`. `showChordsColumn` becomes `isSevenDegree || pentatonicChordSuffixes !== null`.
- [x] 3b.3 Update the Chords `<td>` branch: for `isSevenDegree`, unchanged; otherwise render `getConcreteChordName(degree.noteName, pentatonicChordSuffixes![degree.index])`.

## 4. Wire into ScaleDashboard

- [x] 4.1 In `src/components/ScaleDashboard.tsx`, render `<ScaleInfoTable root={root} family={family} modeId={modeId} />` in the key-row `<section>` after the existing wheel + randomize button, so the section's existing `flex flex-wrap` drops it to a new line on narrow viewports.

## 5. Verification

- [x] 5.1 `pnpm lint` still fails with the same pre-existing, unrelated `eslint-plugin-react`/ESLint toolchain error (fails on `eslint.config.mjs` before reaching any source file). Ran `npx tsc --noEmit` instead — passes with no errors across the whole project, including all files this change touches.
- [x] 5.2 Fetched the running dev server's rendered HTML for Major/Ionian — table renders beside the wheel with correct values, e.g. row 1: `1`, `C`, `Unison`, `Tonic`, `C, C6, Cmaj7, Cadd9`; row 2: `2`, `D`, `Major second`, `Supertonic`, `Dm, Dm6, Dm7, Dm9`.
- [x] 5.3 Fetched Minor Pentatonic's rendered HTML — table now renders with only Formula/Notes/Intervals columns (no Degree/Chords), 5 rows: `1/C/Unison`, `b3/D#/Minor third`, `4/F/Perfect fourth`, `5/G/Perfect fifth`, `b7/A#/Minor seventh` (sharp-spelled, matching this app's existing chromatic-note convention). Also re-confirmed Major/Ionian still shows all 5 columns unchanged (7 rows, row 1: `1, C, Unison, Tonic, C, C6, Cmaj7, Cadd9`).
- [x] 5.4 Fetched Major/Ionian's rendered HTML and confirmed the Degrees row's abstract chord labels (`maj · 6 · maj7 · add9` for degree 1, roman numeral `I`, etc.) are unchanged after the `chords.ts` refactor.
- [ ] 5.5 Not verified — mobile-width visual/scroll behavior needs an actual narrow-viewport check, which this environment's available tools don't support (no browser/screenshot tool, same limitation noted in `enhance-degree-chord-display`'s tasks.md).
- [x] 5.6 Fetched rendered HTML for Major/Ionian (7th degree `B`, major seventh) — Degree column reads `Leading Tone`. Fetched Major/Dorian (7th degree `A#`, minor seventh) — Degree column reads `Subtonic`.
- [x] 5.7 Fetched rendered HTML for Minor Pentatonic's base mode rooted at C — Chords column shows `Cm, D#, Fm7, Gm7, A#5` (sharp-spelled equivalent of `Cm, Eb, Fm7, Gm7, Bb5`, matching this app's chromatic-note convention), no Degree column. Also confirmed Major Pentatonic still shows no Chords column.
- [x] 5.8 Fetched rendered HTML for Major Pentatonic's base mode (SSR defaults to root C, client-side `?root=` isn't server-applied) — Chords column shows `C, Dm7, Em7, Gsus4, Am`, the correct transposition of the confirmed D-rooted `D, Em7, F#m7, Asus4, Bm` down a whole step, no Degree column. Re-fetched Minor Pentatonic's base mode — chords unchanged (`Cm, D#, Fm7, Gm7, A#5`).

## 6. OpenSpec archive

- [x] 6.1 Once implemented and verified, run `/opsx:archive` (or `openspec archive`) for this change. `enhance-degree-chord-display` is already archived (2026-09-17), so `diatonic-chord-vocabulary`'s base spec already exists in `openspec/specs/` for this change's `MODIFIED Requirements` delta to apply against.
