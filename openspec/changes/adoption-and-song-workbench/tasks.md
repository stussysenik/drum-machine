# Implementation Plan: Adoption Lessons & Song Workbench

## Dependency Graph

```text
sequencer boundary event ─┬─ queued song switching ─┬─ Song Workbench
serializable project state ─┤                         └─ starter-song clone
lesson definitions + predicates ──────────────────────── Learn companion
sampling/memory capability ───────────────────────────── Phase 3 lesson enablement
```

## Phase 0 — Contracts and Proofs

- [ ] Task 1: Define serializable project, study, lesson, and workbench projection types.
  - Acceptance: no new type includes `AudioBuffer`; a practice project can be named and marked `study` without changing `Pattern`, `Song`, or `SongEntry` meaning.
  - Verify: focused unit tests compile a study definition and reject/avoid audio-bearing persistence; `pnpm build`.
  - Files: `types/index.ts`, new lesson/project module, tests.
  - Dependencies: Phase 4 sequencer model review.

- [ ] Task 2: Add sequencer boundary event and a deterministic transport fixture.
  - Acceptance: the event occurs once per segment end using audio clock time; a queued song is not selected early.
  - Verify: deterministic fixture covers stopped/immediate, playing/queued, boundary/commit, cancel; `pnpm build`.
  - Files: `composables/useSequencer.ts`, engine bridge, tests.
  - Dependencies: Task 1; Phase 4 implementation.

### Checkpoint: foundation

- [ ] All focused tests pass.
- [ ] `pnpm build` passes.
- [ ] No UI timer schedules or changes audio events.

## Phase 1 — Hear and Navigate

- [ ] Task 3: Author `Pocket 92` and `A/B/Four-Bar Story` as versioned static study data.
  - Acceptance: loading either creates a newly named practice project; its patterns/song use ordinary store types and produce the listed chain.
  - Verify: unit tests assert step maps, 92 BPM, `01×4 → 02×2 → 03×1 → 01×4`, and clone isolation; manual playback.
  - Files: new study-data module, project clone service, tests.
  - Dependencies: Task 1, persistence implementation.

- [ ] Task 4: Implement the read-only Song Workbench and safe selection/switch state machine.
  - Acceptance: it lists 100 songs with empty status, renders entries/repeats, jumps to a segment, summarizes eight channels, and handles the four switching states in `design.md`.
  - Verify: component tests for empty/non-empty/queued/canceled states; manual test while playing; `pnpm build`.
  - Files: workbench component, store selectors/actions, styles, tests.
  - Dependencies: Task 2.

### Checkpoint: first value

- [ ] A new player can load and alter `Pocket 92` without navigating an external document.
- [ ] Faceplate remains the only always-visible music-making surface at the three reference viewport sizes.
- [ ] `pnpm build` passes.

## Phase 2 — Guided Instrument Fluency

- [ ] Task 5: Replace the linear quick-start content with an accessible Learn companion and lesson runtime.
  - Acceptance: lessons show intent, estimated duration, physical target, progress, capability status, close/reopen behavior, and state-derived completion.
  - Verify: keyboard/focus/Escape checks; predicate tests for Phases 0, 1, 2, and 4; `pnpm build`.
  - Files: `TutorialDialog.vue` or replacement companion, lesson runtime, styles, tests.
  - Dependencies: Tasks 3–4.

- [ ] Task 6: Implement Phases 0, 1, 2, and 4 lesson definitions and non-destructive reset behavior.
  - Acceptance: each exercise from the catalogue has setup, completion, explanation, and reset rules; permissive predicates accept legitimate variations.
  - Verify: action-sequence tests plus manual completion with mouse, keyboard, and touch emulation; `pnpm build`.
  - Files: lesson data, runtime tests.
  - Dependencies: Task 5.

## Phase 3 — Sampling Lesson and Resume

- [ ] Task 7: Gate and implement Phase 3 after the memory/sampling engine is complete.
  - Acceptance: it guides a short import/trim/tune action, reflects the memory bar, and blocks safely at the memory limit.
  - Verify: memory-cap integration test and manual import; `pnpm build`.
  - Files: lesson data, sampling integration, tests.
  - Dependencies: Phase 5 sampling engine.

- [ ] Task 8: Persist/migrate project metadata and lesson progress.
  - Acceptance: resume restores the active project and completed lessons after reload; a schema migration preserves old machine data and unknown lesson IDs.
  - Verify: migration fixtures, IndexedDB reload test, export/import round trip; `pnpm build`.
  - Files: `composables/usePersistence.ts`, migration module, tests.
  - Dependencies: Phase 6 persistence engine; Tasks 3, 5.

### Complete gate

- [ ] `pnpm build` passes with zero errors.
- [ ] Focus, reduced motion, and all three reference viewports are checked manually.
- [ ] No copyrighted samples, artist/style labels, analytics, or extra dependencies were introduced.
- [ ] Active OpenSpec records actual verification results and deferred items.

