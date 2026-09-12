import type { StudyDefinition } from '~/types'
import { SP1200 } from '~/types'

/**
 * Pocket 92 — A two-bar, 92 BPM starter study.
 * Kick on 1/9, snare on 5/13, closed hats on odd 16ths, optional clap on 5/13.
 * Demonstrates: immediate playback, pads, mix faders, looped segments.
 */
export const pocket92: StudyDefinition = {
  id: 'pocket-92',
  version: '1.0.0',
  title: 'Pocket 92',
  description: 'A two-bar starter groove at 92 BPM. Kick, snare, closed hats.',
  bpm: 92,
  swing: 54,
  patterns: [
    {
      index: 0,
      name: 'POCKET 92',
      length: 2,
      steps: {
        // Channel 0 (Pad A1): BASS DRUM — kick on 1 and 9
        0: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
        // Channel 1 (Pad A2): SNARE — snare on 5 and 13
        1: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        // Channel 2 (Pad A3): closed hats on odd steps (1,3,5,7,9,11,13,15)
        2: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
        // Channel 3 (Pad A4): optional clap on 5 and 13 (layered with snare)
        3: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        // Channels 4-7: empty
        4: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        5: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        6: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        7: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      },
    },
  ],
  song: null,
}
