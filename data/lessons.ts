import type { LessonDefinition } from '~/types'

/**
 * Lesson catalogue for the SP-1200 adoption companion.
 * Each lesson teaches a real workflow through state-derived completion.
 * Phase 3 (sampling) is gated — it shows as blocked until sampling lands.
 */
export const lessons: LessonDefinition[] = [
  {
    id: 'hear-it-pocket-92',
    phase: 0,
    title: 'Hear It — Pocket 92',
    durationMinutes: 2,
    capability: ['playback'],
    intent: 'Load a starter beat, hear it loop, and adjust the mix.',
    setup: 'new-practice-project',
    steps: [
      { id: 'load', label: 'Load Pocket 92', detail: 'Open Learn and load the Pocket 92 study.' },
      { id: 'play', label: 'Press RUN/STOP', detail: 'Hear the two-bar loop play.' },
      { id: 'mute', label: 'Mute a channel', detail: 'Pull down the snare fader (CH 2) to hear the change.' },
      { id: 'balance', label: 'Adjust kick/snare', detail: 'Set CH 1 and CH 2 faders to taste.' },
    ],
    reset: 'restore-study-snapshot',
  },
  {
    id: 'build-it-backbeat',
    phase: 1,
    title: 'Build It — Backbeat From Empty',
    durationMinutes: 3,
    capability: ['recording'],
    intent: 'Program a basic kick/snare/hat pattern from an empty segment.',
    setup: 'current-project-optional',
    steps: [
      { id: 'select-empty', label: 'Select an empty segment', detail: 'Pick a segment with no steps.' },
      { id: 'kick', label: 'Enter kick on 1 and 9', detail: 'Use step programming or record kick hits.' },
      { id: 'snare', label: 'Enter snare on 5 and 13', detail: 'Add the backbeat.' },
      { id: 'hats', label: 'Add closed hats', detail: 'Program 8th or 16th note hats.' },
    ],
    reset: 'none',
  },
  {
    id: 'make-it-hat-motion',
    phase: 2,
    title: 'Make It Move — Hat Motion',
    durationMinutes: 4,
    capability: ['recording', 'swing'],
    intent: 'Vary density, subtract a hit, and apply swing.',
    setup: 'current-project-optional',
    steps: [
      { id: 'add-sixteenth', label: 'Add 16th note hats', detail: 'Fill in more hat steps.' },
      { id: 'subtract', label: 'Remove one hat hit', detail: 'Clear a single hat step for groove.' },
      { id: 'swing-54', label: 'Set swing to 54%', detail: 'Apply swing and hear the shift.' },
      { id: 'swing-58', label: 'Try swing at 58%', detail: 'Compare the feel.' },
    ],
    reset: 'none',
  },
  {
    id: 'make-it-yours-pitch-decay',
    phase: 3,
    title: 'Make It Yours — Pitch & Decay',
    durationMinutes: 5,
    capability: ['sampling'],
    intent: 'Tune a pad, alter decay, and import a short sound.',
    setup: 'current-project-optional',
    steps: [
      { id: 'tune', label: 'Tune a pad', detail: 'Select a sound and adjust its tuning.' },
      { id: 'decay', label: 'Alter decay', detail: 'Switch to decay mode and change the envelope.' },
      { id: 'import', label: 'Import a short sample', detail: 'Load a sound within the memory budget.' },
    ],
    reset: 'none',
  },
  {
    id: 'arrange-it-ab-story',
    phase: 4,
    title: 'Arrange It — A/B Four-Bar Story',
    durationMinutes: 5,
    capability: ['song-chain'],
    intent: 'Load an arrangement study and see how segments chain into a song.',
    setup: 'new-practice-project',
    steps: [
      { id: 'load', label: 'Load A/B Four-Bar Story', detail: 'Open Learn and load the arrangement study.' },
      { id: 'view-chain', label: 'View the song chain', detail: 'Open Songs to see MAIN x4 -> VARIATION x2 -> FILL x1 -> MAIN x4.' },
      { id: 'jump', label: 'Jump to the fill', detail: 'Select the FILL entry to see its segment.' },
      { id: 'play', label: 'Play the full song', detail: 'Switch to song mode and press RUN/STOP.' },
    ],
    reset: 'restore-study-snapshot',
  },
]

export function getLessonById(id: string): LessonDefinition | undefined {
  return lessons.find(l => l.id === id)
}

export function getLessonsForPhase(phase: number): LessonDefinition[] {
  return lessons.filter(l => l.phase === phase)
}
