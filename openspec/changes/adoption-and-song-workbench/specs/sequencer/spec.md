## ADDED Requirements

### Requirement: Legible, boundary-safe song selection

The product SHALL let a player select among its 100 songs through a compact Song Workbench projection. Selection while stopped SHALL occur immediately; selection during playback SHALL queue for the next sequencer-reported segment boundary and SHALL be cancelable.

#### Scenario: Player queues another song during playback

- **WHEN** playback is running and the player chooses another song
- **THEN** the current segment continues unchanged
- **AND** the LCD and workbench display the pending song
- **AND** the selected song becomes active exactly once at the next segment boundary.

### Requirement: Song and layer orientation without DAW controls

The Song Workbench SHALL show song emptiness, ordered entries, repeats, active position, entry-to-segment jump, and an eight-channel summary of reachable segment layers. It SHALL NOT introduce a piano roll, freeform timeline, or track model outside the existing voice channels.

#### Scenario: Player finds a variation's content

- **WHEN** a player selects a non-empty song and chooses a chain entry
- **THEN** the workbench shows its segment number and reachable channel/pad summary
- **AND** selecting the entry navigates to the corresponding segment using the existing segment-selection path.

