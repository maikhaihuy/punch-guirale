## Purpose

Lets a player hear the current scale played from the root up to the octave
and back down, while seeing which note is sounding and how the sound moves
from one note to the next on the scale wheel and fretboard.

## ADDED Requirements

### Requirement: Play/stop control in the wheel's center
The system SHALL render a play/stop toggle at the center of the scale wheel.
While playback is idle it SHALL present a play affordance and, when
activated, start playback; while playback is running it SHALL present a stop
affordance and, when activated, stop playback. The control SHALL expose an
accessible label naming its current action ("Play scale" / "Stop scale") and
SHALL be operable by keyboard as well as pointer.

#### Scenario: Starting playback from the hub
- **WHEN** playback is idle and the user activates the wheel's center control
- **THEN** the scale begins to play and the control switches to its stop
  affordance and label

#### Scenario: Stopping playback from the hub
- **WHEN** playback is running and the user activates the wheel's center
  control
- **THEN** playback stops and the control returns to its play affordance and
  label

#### Scenario: Keyboard activation
- **WHEN** the center control has keyboard focus and the user presses Enter or
  Space
- **THEN** it toggles playback exactly as a pointer activation would

### Requirement: Playback sequence goes up to the octave and back down
The system SHALL play the current family/mode's in-scale notes in ascending
order from the root, then the root one octave above, then the same notes in
descending order back down to the root, playing the octave root once (it is
not repeated at the turn). The sequence SHALL be derived from the active
family, mode, and root, for every family regardless of degree count, and
SHALL end by itself after the final (lowest) root note without repeating.
Each note SHALL sound for one beat at the metronome's BPM as set when playback
starts.

#### Scenario: A 7-note scale plays 15 notes
- **WHEN** playback runs for C Major (Ionian)
- **THEN** the notes sound in the order C D E F G A B C B A G F E D C, the
  upper C once, and playback then ends by itself

#### Scenario: A pentatonic scale plays its own five notes
- **WHEN** playback runs for Minor Pentatonic rooted at A
- **THEN** the notes sound in the order A C D E G A G E D C A, and playback
  then ends by itself

#### Scenario: Pitch rises then falls
- **WHEN** playback runs for any family, mode, and root
- **THEN** every note in the ascending half is higher in pitch than the one
  before it and every note in the descending half is lower than the one before
  it

#### Scenario: Tempo follows the metronome BPM
- **WHEN** the BPM is 120 at the moment playback starts
- **THEN** consecutive notes begin 0.5 seconds apart

### Requirement: Playback start requires user gesture
The system SHALL start the audio context only from within the user-initiated
activation of the play control, never automatically on page load or on any
non-gesture-triggered code path.

#### Scenario: First play in a session
- **WHEN** the user activates the play control for the first time in a session
  and the audio context is not yet running
- **THEN** the audio context is started as part of that same activation and
  the first note is audible

### Requirement: Sounding note is highlighted on the wheel
The system SHALL, while playback is running, highlight on the scale wheel
the note that is currently sounding, in step with the audio, using a
treatment distinct from the root's filled styling and the scale-membership
dimming, and SHALL highlight no more than one wheel note at a time. The
highlight SHALL compose with the root styling when the sounding note is the
root, and SHALL clear when playback ends or is stopped.

#### Scenario: The highlight follows the audio
- **WHEN** each note of the sequence begins to sound
- **THEN** that note's wheel dot shows the highlight and the previously
  highlighted dot no longer does

#### Scenario: A repeated pitch class is highlighted each time it sounds
- **WHEN** the octave root and the final root sound
- **THEN** the root's wheel dot shows the highlight for each of them

#### Scenario: Highlight clears at the end
- **WHEN** the last note's duration elapses or the user stops playback
- **THEN** no wheel note shows the playback highlight

### Requirement: Animated line between consecutive notes
The system SHALL, while playback is running and a next note exists, animate
a line along the wheel-polygon edge that joins the sounding note to the next
note in the sequence, sweeping from the sounding note toward the next note
over the sounding note's duration so it reaches the next note as that note
begins. The direction of the sweep SHALL reverse in the descending half. The
line SHALL follow the polygon's existing straight edge between the two
notes, including the edge that closes the polygon between the top scale
degree and the root. The line SHALL NOT cover a note's name or degree label
or intercept taps meant for a note or the center control, and SHALL NOT be
shown while playback is idle. When the user's system requests reduced
motion, the sweep SHALL NOT animate and the note highlight alone SHALL
indicate progress.

#### Scenario: The line runs from the sounding note toward the next
- **WHEN** C sounds during C Major playback
- **THEN** a line animates from C's vertex toward D's vertex along the C–D
  polygon edge over one beat, and D's highlight begins as it arrives

#### Scenario: Descending reverses the direction
- **WHEN** B sounds in the descending half of C Major playback
- **THEN** the line animates from B's vertex toward A's vertex

#### Scenario: The closing edge is used at the octave
- **WHEN** B sounds in the ascending half of C Major playback and the next
  note is the octave C
- **THEN** the line animates along the B–C polygon edge from B to C

#### Scenario: No line after the last note
- **WHEN** the final root note sounds
- **THEN** no line animates, since no next note exists

#### Scenario: The line does not block interaction
- **WHEN** the user taps a pitch class or the center control while the line is
  animating
- **THEN** the tap acts on that pitch class or control, not on the line

#### Scenario: Reduced motion suppresses the sweep
- **WHEN** the user's system requests reduced motion and playback runs
- **THEN** no line sweep animates, and each sounding note is still
  highlighted

### Requirement: Sounding note is echoed on the fretboard
The system SHALL, while playback is running, render on the fretboard the
existing same-pitch-class echo highlight for every in-scale note sharing the
sounding note's pitch class, using the same treatment as
`pitch-echo-highlighting`, and SHALL clear it when playback ends or is
stopped. A hover or touch echo from the user SHALL take precedence while it
is active.

#### Scenario: Fretboard echoes the sounding pitch class
- **WHEN** G sounds during C Major playback
- **THEN** every in-scale G on the fretboard shows the echo highlight and
  other pitch classes do not

#### Scenario: Echo clears when playback stops
- **WHEN** playback ends or the user stops it
- **THEN** no fretboard note shows a playback-driven echo highlight

### Requirement: Playback stops when the scale changes
The system SHALL stop playback, silencing any pending notes and clearing all
playback highlights, when the root changes (from the wheel or the bottom-bar
randomizer) or when the user navigates to a different family, mode, or
variant, and when the page is left.

#### Scenario: Selecting another root stops playback
- **WHEN** playback is running and the user selects a different pitch class
  on the wheel
- **THEN** playback stops immediately, no further notes sound, and the
  highlight and line clear

#### Scenario: Randomizing stops playback
- **WHEN** playback is running and the user activates the bottom-bar
  randomizer
- **THEN** playback stops immediately and the root changes

#### Scenario: Changing mode stops playback
- **WHEN** playback is running and the user selects another mode
- **THEN** playback stops immediately, and the new page does not start
  playing

### Requirement: Playback is independent of the metronome and note taps
The system SHALL play the scale independently of the metronome, so starting
or stopping either does not start, stop, or retime the other, and SHALL let
the user tap fretboard notes during playback without interrupting the
sequence or having the tap fail to sound.

#### Scenario: Stopping the metronome mid-playback
- **WHEN** playback and the metronome are both running and the user stops the
  metronome
- **THEN** the scale continues to play to its end

#### Scenario: Tapping a fretboard note mid-playback
- **WHEN** playback is running and the user taps an in-scale fretboard note
- **THEN** the tapped note sounds and the scale sequence continues
  uninterrupted
