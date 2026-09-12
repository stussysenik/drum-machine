import type { StudyDefinition } from '~/types'

/**
 * A/B/Four-Bar Story — An arrangement study.
 * Three segments: MAIN (stable pocket), VARIATION (derived), FILL (sparse transition).
 * Song chain: MAIN x4 -> VARIATION x2 -> FILL x1 -> MAIN x4
 * Demonstrates: segment reuse, repeats, song assembly, readable arrangement.
 */
export const abFourBarStory: StudyDefinition = {
  id: 'ab-four-bar-story',
  version: '1.0.0',
  title: 'A/B Four-Bar Story',
  description: 'An arrangement study with main, variation, and fill segments.',
  bpm: 96,
  swing: 58,
  patterns: [
    {
      // Segment 01: MAIN — stable 2-bar pocket
      index: 0,
      name: 'MAIN',
      length: 2,
      steps: {
        // Kick: 1, 5, 9, 13 (four on the floor)
        0: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
        // Snare: 5, 13 (backbeat)
        1: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        // Closed hats: all 16ths
        2: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
        // Open hat on 8, 16
        3: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true],
        4: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        5: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        6: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        7: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      },
    },
    {
      // Segment 02: VARIATION — same pocket, add clap, remove some hats
      index: 1,
      name: 'VARIATION',
      length: 2,
      steps: {
        // Kick: 1, 5, 9, 13
        0: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
        // Snare: 5, 13
        1: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        // Closed hats: skip some 16ths for groove (remove 3, 7, 11, 15)
        2: [true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true],
        // Clap: 5, 13 (layered)
        3: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        // Open hat on 10
        4: [false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false],
        5: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        6: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        7: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      },
    },
    {
      // Segment 03: FILL — sparse 1-bar transition, resolves into MAIN
      index: 2,
      name: 'FILL',
      length: 1,
      steps: {
        // Kick: 1, 9 (sparse)
        0: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
        // Snare: 5, 13 + ghost on 15
        1: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, true, false],
        // Hats: only 1, 9
        2: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
        // Crash on 1 (channel 3)
        3: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        4: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        5: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        6: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        7: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      },
    },
  ],
  song: {
    entries: [
      { patternIndex: 0, repeats: 4 },
      { patternIndex: 1, repeats: 2 },
      { patternIndex: 2, repeats: 1 },
      { patternIndex: 0, repeats: 4 },
    ],
  },
}
