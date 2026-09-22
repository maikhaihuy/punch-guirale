## REMOVED Requirements

### Requirement: Diatonic triad quality derivation
**Reason**: The triad-selection/triad-ring feature is removed outright
(not deprecated in place) — a 5- or 6-note scale (Pentatonic, Blue)
can't stack tertian thirds the way a 7-note scale can, so extending
this feature to those families isn't musically valid. Rather than keep
it 7-degree-only while Pentatonic/Blue's degree display stays
inconsistent, the whole interaction is removed for every family and
replaced by a single-note highlight, which already worked
consistently everywhere.
**Migration**: `getTriadQuality`, `getRomanNumeral`, and the
`quality`/`romanNumeral` fields on `DiatonicDegree` all remain in
`src/lib/theory.ts` and continue to display in the Degrees row and
scale wheel for 7-degree families — what's removed is only the
*interaction* (selecting a degree used to ring its whole 3-note
triad; now it highlights only that one note, per
`degree-highlighting`). See `scale-dashboard`'s updated requirements
for where the roman numeral now renders.

### Requirement: Degree selector
**Reason**: Superseded by the new `degree-highlighting` capability's
single-note-highlight selector, which covers every family (not just
7-degree ones) with the same "None" default and one selection at a
time.
**Migration**: See `degree-highlighting`'s "Single-note degree
highlight selector" requirement.

### Requirement: Triad membership and visual treatment
**Reason**: The 3-note diatonic triad ring is removed for every
family, including the 7-degree families that previously supported it.
Only the single, already-family-agnostic note highlight remains.
**Migration**: See `degree-highlighting`'s "Highlight visual
treatment" requirement, which carries forward the "scale root is never
double-decorated" and "composes with dimming and mode changes"
behavior for the single-note case.
