## REMOVED Requirements

### Requirement: Fixed chord-suffix table for Minor Pentatonic's base mode
**Reason**: Superseded by the per-slot reference data in
`scale-degree-reference`, which covers Minor Pentatonic (and Major
Pentatonic, Major Blues, Minor Blues) with richer, root-relative chord
suggestions (including chords rooted off the slot's own note and
slash chords) that a 5-entry positional suffix list cannot express.
**Migration**: Read Minor Pentatonic chords from the
`scale-degree-reference` capability (matched by interval pattern
`0, 3, 5, 7, 10`).

### Requirement: Fixed chord-suffix table for Major Pentatonic's base mode
**Reason**: Superseded by the per-slot reference data in
`scale-degree-reference` (see above).
**Migration**: Read Major Pentatonic chords from the
`scale-degree-reference` capability (matched by interval pattern
`0, 2, 4, 7, 9`).
