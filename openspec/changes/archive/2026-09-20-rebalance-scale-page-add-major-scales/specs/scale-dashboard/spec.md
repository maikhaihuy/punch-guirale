## MODIFIED Requirements

### Requirement: Note/Degree toggle
The system SHALL render a switch that toggles every fretboard label
between note name and scale degree. Activating it SHALL update the
fretboard display without changing the route.

The switch SHALL share a single row with the Degrees row at a viewport
width of 768px or more, the Degrees row taking the larger share of the
row's width (8 parts of 10) and the switch the small remainder (2
parts of 10), right of the Degrees row. The degree pills SHALL grow to
fill the Degrees row's whole share, so no unused space is left between
the last pill and the switch's column; where the pills wrap onto more
than one line, each line SHALL fill the share. The switch and its "Note" and
"Degree" labels SHALL always render in full, never truncated or clipped,
however narrow that remainder is. Below 768px the switch SHALL instead
sit on its own line beneath the Degrees row.

#### Scenario: Toggling note/degree from the dashboard
- **WHEN** the user activates the Note/Degree switch
- **THEN** every fretboard label switches between note name and scale
  degree, without a route change

#### Scenario: Degrees row gets most of the width on a wide viewport
- **WHEN** the dashboard renders at a viewport width of 768px or more
- **THEN** the Degrees row and the Note/Degree switch appear on one row,
  split 8:2 with the Degrees row taking the larger share, the degree
  pills spread across that whole share, and the switch's labels fully
  visible

#### Scenario: Switch drops below the Degrees row on a narrow viewport
- **WHEN** the dashboard renders at a viewport width below 768px
- **THEN** the Note/Degree switch appears on its own line beneath the
  Degrees row, and the Degrees row uses the full width
