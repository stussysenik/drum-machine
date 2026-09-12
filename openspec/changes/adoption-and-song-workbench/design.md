# Design: Adoption Lessons & Song Workbench

## Design Principle

The machine teaches by letting the person touch the machine. The companion translates intent (“make a beat move”, “find the variation”) into the existing controls, then gets out of the way. It must never become a competing arrangement surface.

## Surfaces

```text
Browser shell
├─ SP-1200 faceplate (authoritative performance surface)
│  ├─ LCD (short status: loaded study, queued song, completion)
│  └─ existing tutorial/help affordance
└─ Companion dialog (opt-in, modal only while open)
   ├─ Learn: phase cards → one active exercise → progress
   └─ Songs: song selector → chain navigator → layer summary
```

The companion is not visible during normal use. “Learn” and “Songs” are two tabs of one dialog, not two floating panels. A compact invocation label may live in the browser chrome or inside the existing tutorial dialog; it must not add fictional silkscreen or relocate any physical control.

## Lesson Contract

```ts
type LessonCapability = 'playback' | 'recording' | 'swing' | 'sampling' | 'song-chain'

interface LessonDefinition {
  id: string
  phase: 0 | 1 | 2 | 3 | 4
  title: string
  durationMinutes: number
  capability: LessonCapability[]
  intent: string
  setup: 'none' | 'new-practice-project' | 'current-project-optional'
  steps: LessonStep[]
  completion: LessonPredicate
  reset: 'restore-study-snapshot' | 'none'
}
```

`LessonDefinition` is static, serializable content. It may refer to canonical pad IDs, segment indexes, and parameter ranges, but not an `AudioBuffer`. Runtime evaluation reads a narrow, serializable lesson projection derived from the store and sequencer events. The evaluator emits `started`, `step-completed`, `completed`, or `blocked(capability)`; it never directly changes the project.

### Completion semantics

- A step remains incomplete if a user simply visits a screen.
- A direct action earns completion: for example, `toggleStep(0, 0)` for the first kick, a selected swing value, or a song chain matching the expected ordered entries/repeats.
- Predicates are permissive where musical intent allows it. `Hat Motion` accepts any removed hat hit and either 54% or 58% swing; it does not demand a factory-perfect beat.
- The lesson explicitly shows the next physical control and its current state. It may temporarily highlight the matching on-screen control, but it does not intercept it.
- Reset restores only a separately-created practice-project snapshot. Current-project lessons have no destructive reset.

## Starter Beat Data

`Pocket 92` is a two-measure, 4/4 exercise at 92 BPM with a kick, snare, closed hat, and optional clap. Its canonical step map is source-controlled data and is rendered through the same `Pattern` type and audio path as user work. The UI calls it a “study”, never an authentic factory SP-1200 sequence.

`A/B/Four-Bar Story` creates a named practice project containing:

| Segment | Role | Length | Relationship |
| --- | --- | --- | --- |
| 01 MAIN | stable pocket | 2 bars | primary loop |
| 02 VARIATION | same pocket plus/subtracted hat or clap change | 2 bars | derived from MAIN |
| 03 FILL | sparse transition | 1 bar | resolves into MAIN |

The starter song chain is intentionally editable and visualized as `01×4 → 02×2 → 03×1 → 01×4`. It must store raw `SongEntry` data, not display-only labels.

## Song Workbench Contract

The workbench is a projection of state, not a new sequencing model.

```ts
interface SongWorkbenchState {
  selectedSong: number
  playState: 'stopped' | 'playing'
  pendingSong: number | null
  activeEntryIndex: number | null
  entries: Array<{ position: number; patternIndex: number; repeats: number; mixOverride?: number; tempoOverride?: number }>
  layers: Array<{ channel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; pads: PadId[]; activeSteps: number; sampleLabel: string | null }>
}
```

Layer counts include the selected song's reachable segments; a segment appears once even when repeated. The workbench may expose the current entry and a segment jump, but it cannot expose a piano roll, free drag-and-drop timeline, global track mute, or more than the SP-1200's eight channel concepts.

### Switching state machine

```text
stopped + choose song      → select immediately → LCD “SONG: NN”
playing + choose song      → pending(nn)        → LCD “NEXT SONG: NN”
pending(nn) + boundary     → select nn          → clear pending
pending(nn) + cancel       → clear pending      → current song continues
```

“Boundary” is an engine-reported end of a segment, not a Vue timer or display playhead tick. The switch behavior applies only after song playback is implemented; before then the control is disabled with an explanatory capability message.

## Persistence and Safety

- Persist `{ schemaVersion, projectName, source: 'user' | 'study', lessonProgress, lastOpenedAt }` alongside existing serializable machine state.
- Store an immutable source-controlled study snapshot and clone it to a new local project on load. Never mutate the source definition or overwrite the active project silently.
- Migration rules are pure functions from one serializable version to the next. Unknown lesson IDs are retained as archived completion records; removed study IDs are not reinterpreted.
- Import/export includes project metadata and lesson progress only when the user chooses full-project export. A lesson definition itself remains local product content.

## Accessibility and Motion

- Dialog uses `role="dialog"`, `aria-modal="true"`, named tabs, predictable heading hierarchy, focus trap, Escape close, and focus restoration.
- Step status cannot rely on color or LED brightness; it includes concise text.
- Pad/control highlights respect `prefers-reduced-motion` and do not flash faster than 3 Hz.
- No hover-only instruction. Pointer, keyboard, and touch can complete every lesson action.

## Risks / Mitigations

| Risk | Mitigation |
| --- | --- |
| Companion dilutes fidelity | Keep it opt-in, browser-owned, and close it by default; all sound-making remains on the faceplate. |
| Starter beat overwrites a real project | Create a named clone after a confirmation that names the affected project. |
| Lesson predicates become brittle | Test predicates against action sequences and allow musically equivalent outcomes. |
| Queued song switch clicks or drifts | Drive it from the sequencer's boundary event and test it against an AudioContext-time fixture. |
| Sample exercise promises unavailable features | Capability-gate it and display the reason, rather than showing a broken step. |

