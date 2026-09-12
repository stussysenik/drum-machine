# Change: Adoption Lessons & Song Workbench

## Objective

Make the SP-1200 understandable and rewarding on the first session without turning its faithful hardware faceplate into a DAW. A new player can load a small, credited starter beat, hear why the machine is useful, complete hands-on exercises in a deliberate order, and orient themselves in a song or its layers without losing the physical workflow.

This change is **not** a genre library, an AI beat generator, cloud sharing, or a second sequencer. It is the adoption layer around the instrument that teaches the real Segment → Song workflow already defined in the hardware specs.

## User Outcomes

- In under two minutes, a first-time player can hear and alter a complete, legal-to-ship starter beat.
- A learner progresses through short, state-aware exercises: sound/bank fluency, a basic pattern, groove and variation, sound shaping, then arrangement.
- A player can select a song, see its chain, jump to a segment, and understand which pad/bank layers are used—without treating the UI as a multitrack DAW.
- The browser-only help surface is easy to dismiss, keyboard accessible, and never obscures active performance by default.

## Scope and Boundaries

### Always

- Preserve the physical SP-1200 as the primary interface and all locked constraints: 32 sound slots, eight voices, 100 segments, 100 songs, banked pads, and hardware-style song chaining.
- Use the app's own stock/user samples only. Do not imply a copyrighted kit or attach a named artist/style to a beat.
- Make every lesson actionable against real machine state; completion comes from an observed state transition, never just clicking “next.”
- Keep audio buffers and the transport out of Vue/Pinia reactivity, per `openspec/AGENTS.md`.
- Version starter-beat definitions and lesson-progress data so persisted sessions remain migratable.

### Ask first

- Adding a third-party audio pack, any artist/label/style attribution, analytics/telemetry, cloud accounts, or a new dependency.
- Altering the physical faceplate geometry or claiming that a browser companion exists on original hardware.

### Never

- Replace the faceplate with a piano roll, mixer view, side-by-side DAW tracks, genre presets, or automatic composition.
- Autoplay sound, overwrite a user's current project, or mutate a user sample during a lesson without an explicit confirmation.
- Encode AudioBuffers in Pinia/local JSON or schedule audio from UI timers.

## Product Decisions

| Decision | Chosen behavior | Rationale |
| --- | --- | --- |
| Help location | Dismissible browser companion opened from the existing tutorial/help affordance; no permanent panel on the chassis | Keeps the physical replica primary while making unfamiliar workflows discoverable. |
| Lesson unit | A 2–5 minute objective with one visible target, a real state predicate, and one concise explanation | Teaches instrument fluency rather than a slideshow. |
| Beat content | Four authored, generic technique studies with machine-readable steps; a learner may load a **new** practice project or apply the pattern to the current project after confirmation | Gives immediate sound and a safe learning path. |
| Organization | A compact Song Workbench: song selector, chain/position, segment jump, and an 8-channel layer summary | Solves orientation, not arrangement by spreadsheet. |
| Song switching | Quantized at the current segment boundary while transport runs; immediate while stopped; status is shown on LCD and workbench | Prevents audible mid-pattern discontinuities and makes the pending action legible. |

## Sample Beat / Exercise Catalogue

These are deliberately musical exercises, not “styles.” Their audible result, layer choices, and edit target make the machine's possibilities concrete.

| Phase | Study | Starting material | Learner action | Demonstrates |
| --- | --- | --- | --- | --- |
| 0 — Hear it | **Pocket 92** | One 2-bar kick/snare/hat pattern at 92 BPM | Run, mute/restore one channel, adjust the kick/snare balance | Immediate playback, pads, mix faders, looped segments |
| 1 — Build it | **Backbeat From Empty** | Empty 2-bar segment with selected stock pads | Enter kick on 1/9 and snare on 5/13; record or step-program closed hats | Pattern structure, auto-correct, record vs. step editing |
| 2 — Make it move | **Hat Motion** | The prior backbeat plus an optional open hat | Add 16ths, remove one hit, apply 54% then 58% swing, use TAP/REPEAT for a short roll | Density, subtraction, swing, repeat without genre prescription |
| 3 — Make it yours | **Pitch, Decay, Memory** | A short melodic/percussion sample and a safe bank slot | Tune a pad, alter decay, then import/trim one short sound within the memory budget | SP character, destructive constraints, sound ownership |
| 4 — Arrange it | **A/B/Four-Bar Story** | Three named segments: MAIN, VARIATION, FILL | Copy/edit a variation, create a one-bar fill, chain `MAIN ×4 → VARIATION ×2 → FILL ×1 → MAIN ×4` | Segment reuse, repeats, song assembly, readable arrangement |

The implementation must ship the data for **Pocket 92** and **A/B/Four-Bar Story** first. Phases 1–3 are gated by the relevant sequencer and sampling capabilities already planned in build phases 4–5; their lesson records may exist earlier but must display “available when this capability lands,” not a dead control.

## Success Criteria

- A new session presents one non-blocking invitation to play `Pocket 92`; declining it leaves a silent, usable machine.
- Loading a study creates a named, isolated practice project and shows exactly which project will change before confirmation.
- Each available lesson has an explicit entry state, completion predicate, reset action, and a completion state persisted locally.
- The workbench can select any of 100 songs, identify empty/non-empty songs, show the ordered song entries and repeats, jump to an entry's segment, and show a compact used-pad/channel summary.
- Switching a song while stopped selects it immediately. Switching while running queues it for the next segment boundary; canceling the pending choice leaves playback unchanged.
- Neither the lesson flow nor workbench changes the audio schedule except through existing engine/sequencer commands.
- At 948×832, 1024×768, and 1440×900, the faceplate remains usable and recognisable with the companion closed; opening it traps focus, supports Escape, and restores focus to its launcher.

## Dependencies and Sequencing

1. Phase 4 sequencer work must provide trustworthy segment-boundary and song-entry events before queued switching is implemented.
2. Phase 5 sampling/memory work must exist before the sample-import exercise is enabled.
3. Phase 6 persistence must persist the new project metadata and migration version before the tutorial can claim resume support.
4. The companion shell and read-only workbench may land after Phase 4; authored practice-project creation lands only after the persistence model is stable.

## Commands

- Build: `pnpm build`
- Manual verification: `pnpm dev`

No test/lint script is currently declared. The implementation change must add a focused test command before behavior changes land, then document it here.

## Research Evidence

- `docs/hardware-manuals/SP1200_Owners_Manual.txt`, accessed 2026-09-11: the manual describes segments as reusable patterns and songs as ordered chains with repeat, mix, and tempo changes (Part 3); confidence high; supports the arrangement lesson and workbench vocabulary.
- Same source, sections 2D–2K: auto-correct, real-time/step recording, repeat, copy, and swing are core learning actions; confidence high; supports Phases 1–2.
- `openspec/specs/sequencer.md`: project contract defines 100 patterns, 100 songs, and pattern chaining; confidence high; bounds workbench scope.

