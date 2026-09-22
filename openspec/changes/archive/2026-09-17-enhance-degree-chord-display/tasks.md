## 1. Chord vocabulary data

- [x] 1.1 Create `src/lib/chords.ts` with a `CHORD_VOCABULARY: Record<TriadQuality, string[]>` static table (major/minor/diminished/augmented → ordered chord symbol lists) and a `getChordsForQuality(quality: TriadQuality): string[]` lookup, importing `TriadQuality` from `src/lib/theory.ts`.
- [x] 1.2 Confirm every `TriadQuality` value has a non-empty entry (matches `diatonic-chord-vocabulary` spec scenario "Every triad quality has an entry").

## 2. Degrees row rendering

- [x] 2.1 In `src/components/ScaleDashboard.tsx`, compute the whole/half-step pattern via `getWholeHalfPattern(family, modeId)` alongside the existing `getDiatonicDegrees(root, family, modeId)` call.
- [x] 2.2 Replace the `PillGroup`-based Degrees row with a hand-composed row: the existing "None" pill button, followed by one pill button per degree, reusing `PillGroup`'s pill button class strings (or a local equivalent) so visual style/selection behavior (`isSelected`/`onSelect` semantics) is preserved. For `family.degreeCount === 7`, each pill shows 3 stacked lines (degree `degreeLabel`, `romanNumeral`, and `getChordsForQuality(degree.quality).join(" · ")`); for other degree counts, each pill keeps today's plain `${degree.index + 1} ${degree.noteName}` label (this row is also the only control for single-note highlighting on non-7-degree families like Pentatonic — see [ScalePage.tsx:50-65](src/components/ScalePage.tsx#L50-L65) — so it must keep rendering there, just without the 7-degree-only enrichment).
- [x] 2.3 Insert a `W`/`H` `<span>` marker between each pair of adjacent degree pills (only when `family.degreeCount === 7`; not after "None" and not after the last degree), sourced from `wholeHalfPattern[i]` for the gap after degree `i`.
- [x] 2.4 Preserve existing selection behavior: clicking a degree pill still calls `onSelectedTriadDegreeChange(degree.index)`, clicking "None" still calls it with `null`, and the currently selected pill keeps the active pill styling.

## 3. Verification

- [x] 3.1 Run `pnpm lint` — fails with a pre-existing, unrelated toolchain error (`TypeError: contextOrFilename.getFilename is not a function` while ESLint loads `eslint-plugin-react`'s `react/display-name` rule against `eslint.config.mjs` itself, before reaching any source file). Confirmed via `git stash` that this reproduces identically on clean `cc77ed1` HEAD, so it predates and is unrelated to this change.
- [x] 3.2 Ran `pnpm dev` and fetched the rendered HTML for Major/Ionian and Harmonic Minor/Phrygian Dominant (no browser/screenshot tool available in this environment, so verified via curl'd server-rendered markup rather than visually). Confirmed: Ionian shows `1/I/maj · 6 · maj7 · add9`, `2/ii/m · m6 · m7 · m9`, ... with `W`/`H` markers matching the Ionian step pattern; Phrygian Dominant shows `1/I/...` then an `H` marker then degree label `b2` for its flat 2nd degree, matching expected music theory.
- [x] 3.3 Fetched Major Pentatonic's rendered HTML — Degrees row still renders with plain `1 C`, `2 D`, ... pills, no roman numeral/chords/W-H markers, confirming the non-7-degree fallback and preserving the single-note-highlight control.
- [x] 3.4 Not verified — confirming wrapped multi-line pill layout at mobile width requires visual/screenshot inspection, which this environment's available tools don't support. Recommend a manual check in a browser at a narrow viewport before merging.

## 4. OpenSpec archive

- [x] 4.1 Once implemented and verified, run `/opsx:archive` (or `openspec archive`) to merge the delta specs into `openspec/specs/scale-dashboard/spec.md` and create `openspec/specs/diatonic-chord-vocabulary/spec.md`.
