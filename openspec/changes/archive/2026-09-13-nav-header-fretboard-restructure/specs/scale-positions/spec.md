## REMOVED Requirements

### Requirement: Mobile fit for position view
**Reason**: Superseded by `fretboard-viewport`'s "Position pills control
the visible fret range" requirement, which applies the same
move/zoom-to-position-span behavior on any viewport size, not only
mobile, and is owned by the fretboard component rather than triggered
implicitly by position selection.
**Migration**: See `specs/fretboard-viewport/spec.md`. No user-facing
behavior is lost on mobile; the same fit-to-position behavior now also
applies on desktop.
