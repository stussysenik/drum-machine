// SP-1200 Sequencer — Tone.js Transport look-ahead clock
// Web Audio API internal clock (not JS timers) for zero-drift timing.
// Swing applied to even steps (SP-1200 behavior, 50-66 range).
//
// SINGLETON: all callers share one instance so keyboard, faceplate,
// and app.vue all control the same transport state.

import * as Tone from 'tone'
import type { StepIndex, VoiceChannel, PadId } from '~/types'
import { SP1200 } from '~/types'

// Module-level singleton state
let isRunning = false
let stepIndex = 0
let transportId: number | null = null
let _store: ReturnType<typeof useDrumMachineStore> | null = null
let _audio: ReturnType<typeof useAudioEngine> | null = null

// Song mode state
let songEntryIndex = 0
let songRepeatCount = 0
let totalStepsInPattern = 0
let segmentBoundaryCallback: (() => void) | null = null

function getStore() {
  if (!_store) _store = useDrumMachineStore()
  return _store
}

function getAudio() {
  if (!_audio) _audio = useAudioEngine()
  return _audio
}

// Convert store swing (50-66) to Tone.js swing amount (0-1)
function getSwingAmount(): number {
  return (getStore().swing - 50) / 16  // 0 to 1
}

// Called on each 16th note tick from Tone.js Transport
function onStep(time: number) {
  const store = getStore()
  const audio = getAudio()

  if (!isRunning || !store.playing) return

  // In song mode, check if we need to advance to next song entry
  if (store.mode === 'song') {
    handleSongAdvance()
  }

  const pattern = store.activePattern

  // Check all 8 voice channels for active steps
  for (let v = 0; v < 8; v++) {
    const voiceChannel = v as VoiceChannel
    const step = pattern.steps[voiceChannel][stepIndex]

    if (step.active) {
      // Find the first pad (across all banks) that has a sample for this voice channel
      const padA = v as PadId
      const padB = (v + 8) as PadId
      const padC = (v + 16) as PadId
      const padD = (v + 24) as PadId

      if (audio.hasSample(padA)) {
        audio.triggerPad(padA)
      } else if (audio.hasSample(padB)) {
        audio.triggerPad(padB)
      } else if (audio.hasSample(padC)) {
        audio.triggerPad(padC)
      } else if (audio.hasSample(padD)) {
        audio.triggerPad(padD)
      }
    }
  }

  // Schedule visual update on the main thread (after audio is queued)
  Tone.Draw.schedule(() => {
    store.setCurrentStep(stepIndex as StepIndex)
  }, time)

  // Advance to next step
  stepIndex++
  totalStepsInPattern++

  // When we complete 16 steps, advance song entry if in song mode
  if (stepIndex >= 16) {
    stepIndex = 0

    // Emit segment boundary event for queued song switching
    if (segmentBoundaryCallback) {
      segmentBoundaryCallback()
    }

    if (store.mode === 'song') {
      songRepeatCount++
      const song = store.songs[store.currentSong]
      const entry = song.entries[songEntryIndex]

      if (entry && songRepeatCount >= entry.repeats) {
        // Move to next entry
        songEntryIndex = (songEntryIndex + 1) % song.entries.length
        songRepeatCount = 0

        if (songEntryIndex === 0) {
          // Looped back to start — full song cycle complete
        }

        // Load the new pattern
        const nextEntry = song.entries[songEntryIndex]
        if (nextEntry) {
          store.selectPattern(nextEntry.patternIndex)
        }
      }
    }
  }
}

// Handle song mode pattern advancement
function handleSongAdvance() {
  const store = getStore()
  const song = store.songs[store.currentSong]

  if (song.entries.length === 0) return

  // Make sure we're in bounds
  if (songEntryIndex >= song.entries.length) {
    songEntryIndex = 0
    songRepeatCount = 0
  }

  // Load the correct pattern for current entry
  const entry = song.entries[songEntryIndex]
  if (entry && store.currentPattern !== entry.patternIndex) {
    store.selectPattern(entry.patternIndex)
  }
}

// Start the sequencer
function start() {
  if (isRunning) return

  const store = getStore()
  const audio = getAudio()

  audio.init()
  audio.resume()

  isRunning = true
  stepIndex = 0
  songEntryIndex = 0
  songRepeatCount = 0
  totalStepsInPattern = 0
  store.play()

  // Configure Tone.js Transport
  const transport = Tone.getTransport()
  transport.bpm.value = store.bpm
  transport.swing = getSwingAmount()
  transport.swingSubdivision = '16n'

  // Schedule repeating 16th note callback
  transportId = transport.scheduleRepeat((time) => {
    onStep(time)
  }, '16n')

  transport.start()
}

// Stop the sequencer
function stop() {
  isRunning = false

  const transport = Tone.getTransport()
  transport.stop()

  if (transportId !== null) {
    transport.clear(transportId)
    transportId = null
  }

  stepIndex = 0
  getStore().stop()
  getAudio().stopAll()
}

// Toggle play/stop
function toggle() {
  if (getStore().playing) {
    stop()
  } else {
    start()
  }
}

// Tap tempo — average last 4 taps
const tapTimes: number[] = []
function tapTempo() {
  const now = performance.now()
  tapTimes.push(now)

  if (tapTimes.length > 4) {
    tapTimes.splice(0, tapTimes.length - 4)
  }

  if (tapTimes.length >= 2) {
    let total = 0
    for (let i = 1; i < tapTimes.length; i++) {
      total += tapTimes[i] - tapTimes[i - 1]
    }
    const avgInterval = total / (tapTimes.length - 1)
    const bpm = Math.round(60000 / avgInterval)
    getStore().setBpm(bpm)
    Tone.getTransport().bpm.value = bpm
  }
}

// Sync transport settings when store changes
function syncTransport() {
  const transport = Tone.getTransport()
  transport.bpm.value = getStore().bpm
  transport.swing = getSwingAmount()
}

// Cleanup
function dispose() {
  stop()
}

export function useSequencer() {
  return {
    start,
    stop,
    toggle,
    tapTempo,
    syncTransport,
    dispose,
    onSegmentBoundary(callback: () => void) {
      segmentBoundaryCallback = callback
    },
  }
}
