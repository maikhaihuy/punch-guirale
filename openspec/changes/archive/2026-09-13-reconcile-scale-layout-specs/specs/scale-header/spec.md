## REMOVED Requirements

### Requirement: Key row hosts root note selection
**Reason**: This capability is renamed to `scale-dashboard` as part of
the `ScaleHeader` → `ScaleDashboard` component rename; the requirement
itself is unchanged, just relocated.
**Migration**: See `specs/scale-dashboard/spec.md`, "Key row hosts root
note selection".

### Requirement: Primary row shows current degree, note, and scale notes
**Reason**: Removed from the product — its content (current degree/note
and the scale's note list) is now redundant with the "Degrees" row's
degree+note pills.
**Migration**: None. This information is no longer surfaced as a
standalone row.

### Requirement: Secondary row hosts display toggles
**Reason**: Triad highlighting moved to `scale-dashboard`'s "Degrees"
row (relabeled from roman numerals to degree+note pills); the
note/degree toggle moved to `scale-dashboard` unchanged; the W–H
interval pattern was dropped entirely.
**Migration**: See `specs/scale-dashboard/spec.md`, "Degrees row shows
scale degrees with their notes" and "Note/Degree toggle".

### Requirement: Mobile secondary row is collapsible
**Reason**: With the primary row and W–H pattern gone, remaining
dashboard content is light enough that it no longer needs a mobile
collapse affordance.
**Migration**: None. This capability has no remaining requirements
after this change; `openspec/specs/scale-header/` should be deleted as
part of archiving this change.
