// SP-1200 Keyboard Handler — global shortcuts
// Maps keys to pads, transport, and navigation.
// Uses raw keyboard events, works globally, ignores inputs.
//
// SINGLETON: one set of event listeners shared across all composables.

import type { PadId, VoiceChannel } from '~/types'

let initialized = false

// Pad keys: top row = Bank A pads 1-8, home row = Bank B pads 9-16
const padKeys: Record<string, PadId> = {
  'q': 0, 'w': 1, 'e': 2, 'r': 3,
  't': 4, 'y': 5, 'u': 6, 'i': 7,
  'a': 8, 's': 9, 'd': 10, 'f': 11,
  'g': 12, 'h': 13, 'j': 14, 'k': 15,
}

function handleKeyDown(e: KeyboardEvent) {
  const store = useDrumMachineStore()
  const sequencer = useSequencer()
  const audio = useAudioEngine()

  // Ignore if typing in input/textarea
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement ||
    e.target instanceof HTMLSelectElement
  ) return

  const key = e.key.toLowerCase()
  if (e.metaKey || e.ctrlKey) return

  // Space — toggle play
  if (key === ' ') {
    e.preventDefault()
    sequencer.toggle()
    return
  }

  // Escape — stop
  if (key === 'escape') {
    sequencer.stop()
    return
  }

  // Pad trigger keys (q-w-e-r-t-y-u-i, a-s-d-f-g-h-j-k)
  if (padKeys[key] !== undefined) {
    const padId = padKeys[key]
    store.selectPad(padId)
    audio.triggerPad(padId)
    return
  }

  // Number keys 1-8 — quick select pads
  if (key >= '1' && key <= '8') {
    const padOffset = parseInt(key) - 1
    const bankStart = store.selectedBank === 'A' ? 0 : 8
    store.selectPad((bankStart + padOffset) as PadId)
    return
  }

  // Arrow keys
  if (key === 'arrowleft') {
    e.preventDefault()
    const prev = Math.max(0, store.currentStep - 1) as PadId
    store.setCurrentStep(prev)
    return
  }
  if (key === 'arrowright') {
    e.preventDefault()
    const next = Math.min(15, store.currentStep + 1) as PadId
    store.setCurrentStep(next)
    return
  }
  if (key === 'arrowup') {
    e.preventDefault()
    store.nudgeParameter(1)
    return
  }
  if (key === 'arrowdown') {
    e.preventDefault()
    store.nudgeParameter(-1)
    return
  }

  // BPM control
  if (key === '[') {
    store.setBpm(store.bpm - 1)
    return
  }
  if (key === ']') {
    store.setBpm(store.bpm + 1)
    return
  }

  // Swing
  if (key === ',') {
    store.setSwing(store.swing - 1)
    return
  }
  if (key === '.') {
    store.setSwing(store.swing + 1)
    return
  }

  // Tab — next pad
  if (key === 'tab') {
    e.preventDefault()
    const nextPad = ((store.selectedPad + 1) % 16) as PadId
    store.selectPad(nextPad)
    return
  }

  // Backtick — tap tempo
  if (key === '`') {
    sequencer.tapTempo()
    return
  }

  // Delete/Backspace — clear pattern
  if (key === 'delete' || key === 'backspace') {
    store.clearPattern()
    return
  }

  // Enter — clear current voice channel
  if (key === 'enter') {
    store.clearVoiceChannel(store.selectedPad % 8 as VoiceChannel)
    return
  }

  // P — select Pitch parameter
  if (key === 'p') store.setSelectedParameter('pitch')
  // V — select Volume parameter
  if (key === 'v') store.setSelectedParameter('gain')
  // S — select Swing
  if (key === 's' && !e.shiftKey) store.setSelectedParameter('swing')
  // B — select Tempo
  if (key === 'b') store.setSelectedParameter('bpm')
}

function init() {
  if (initialized) return
  initialized = true
  window.addEventListener('keydown', handleKeyDown)
}

function dispose() {
  if (!initialized) return
  initialized = false
  window.removeEventListener('keydown', handleKeyDown)
}

export function useKeyboard() {
  return { init, dispose, padKeys }
}
