# Related-Spec Audit — 2026-09-11

## Reviewed completed/active OpenSpec material

| Source | Relevant state | Effect on this change |
| --- | --- | --- |
| `openspec/changes/build-order.md` | Phase 1 faceplate is incomplete; it records an existing tutorial dialog and deferred coordinate/DSP validation. | The companion must be browser-owned and opt-in; no faceplate geometry or hardware claim is added. |
| `openspec/specs/sequencer.md` | Pattern/song contract exists, but no explicit boundary event or queued song selection is specified. | Add the event/state-machine requirement; do not implement it against UI timing. |
| `openspec/specs/persistence.md` | Persistence is planned but currently lacks project metadata, schema migration, and lesson progress. | Add versioned serializable metadata as a delta, gated on Phase 6. |
| `openspec/specs/sampling.md` | Sample loading and 10-second memory are planned; mic/import workflow is not verified complete. | Sampling lesson remains capability-gated. |
| `components/faceplate/SongPanel.vue` | An early song editor exists but is a local overlay and relies on store methods that are not present in the inspected store. | Treat it as stale/unverified; the workbench replaces neither data model nor hardware controls until its behavior is reconciled and tested. |
| `components/faceplate/TutorialDialog.vue` | A static five-slide quick-start exists. | Reuse its accessible dialog foundation where valid, but replace slideshow-only progress with state-aware lessons. |

## Deferred items and concrete follow-up

- **Hardware visual measurement:** Remains owned by build-order Phase 1. This change does not approve companion placement on the physical panel; use browser chrome/dialog only.
- **DSP hardware capture:** Remains owned by build-order Phase 3. Starter-beat validation checks musical state and playback plumbing, not a claim of hardware-identical sound.
- **Real song transport:** The currently inspected store has no verified `selectSong`, `addSongEntry`, or boundary-callback implementation although a UI component references them. Phase 4 must settle the sequencer contract before Task 2.
- **Persistence:** No current schema version/migration contract was found. Phase 6 must add it before resumption or project cloning is released.

