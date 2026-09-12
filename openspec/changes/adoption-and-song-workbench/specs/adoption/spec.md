## ADDED Requirements

### Requirement: Progressive, state-aware instruction

The product SHALL provide an opt-in learning companion that teaches available SP-1200 workflows in ordered phases. Each lesson SHALL state an outcome, required capabilities, setup behavior, actionable steps, a state-derived completion predicate, and a non-destructive reset policy.

#### Scenario: A learner completes a practical action

- **WHEN** a learner performs the required action on the actual faceplate or its existing control path
- **THEN** the lesson marks the corresponding step complete without requiring a separate acknowledgement
- **AND** the learner can continue playing without the companion open.

#### Scenario: A capability is not yet implemented

- **WHEN** a learner selects a lesson requiring unavailable sampling or sequencer behavior
- **THEN** the product explains the unavailable capability
- **AND** it does not show an inert action or mark the lesson complete.

### Requirement: Safe, authored studies

The product SHALL provide source-controlled, generic technique studies using its own playable sample assignments and normal pattern/song data. Loading a study SHALL create a distinct practice project only after confirmation.

#### Scenario: Study loading preserves user work

- **WHEN** a player chooses to load a starter study while another project is active
- **THEN** the confirmation identifies that a new practice project will be created
- **AND** the active project remains unchanged unless the player confirms.

