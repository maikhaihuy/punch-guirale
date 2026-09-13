## REMOVED Requirements

### Requirement: Position selection
**Reason**: CAGED position selection was removed from the product
entirely — there is no position selector anymore, fixed or otherwise.
**Migration**: None. This capability has no remaining requirements
after this change; `openspec/specs/scale-positions/` should be deleted
as part of archiving this change.

### Requirement: Position visual treatment
**Reason**: Dimming, root-prominence-while-dimmed, and the position
background band all depended on a selected position, which no longer
exists.
**Migration**: None. See the "Position selection" removal above.
