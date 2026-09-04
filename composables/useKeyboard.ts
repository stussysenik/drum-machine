// Keyboard & Gesture Handler
// ThinkPad T480-style: keyboard-first, TrackPoint gestures
// All actions are named commands from one registry

import type { VoiceId } from '~/types'

export function useKeyboard() {
  const store = useDrumMachineStore()
  const sequencer = useSequencer()
  const audio = useAudioEngine()

  // Voice mapping - top row triggers voices
  const voiceKeys: Record<string, VoiceId> = {
    'q': 'bd',   // Bass Drum
    'w': 'sd',   // Snare
    'e': 'lt',   // Low Tom
    'r': 'mt',   // Mid Tom
    't': 'ht',   // High Tom
    'y': 'rs',   // Rimshot
    'a': 'cp',   // Clap
    's': 'cb',   // Cowbell
    'd': 'cy',   // Cymbal
    'f': 'oh',   // Open Hat
    'g': 'ch',   // Closed Hat
    'h': 'cl'    // Click
  }

  // View switching
  const viewKeys: Record<string, string> = {
    '1': 'performance',
    '2': 'design',
    '3': 'mix',
    '4': 'pattern',
    '5': 'module'
  }

  // Handle keydown
  function handleKeyDown(e: KeyboardEvent) {
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    const key = e.key.toLowerCase()

    // Space - toggle play
    if (key === ' ') {
      e.preventDefault()
      sequencer.toggle()
      return
    }

    // Escape - stop
    if (key === 'escape') {
      sequencer.stop()
      return
    }

    // View switching (1-5)
    if (viewKeys[key] && !e.metaKey && !e.ctrlKey) {
      store.setView(viewKeys[key] as any)
      return
    }

    // Voice triggering (q-w-e-r-t-y, a-s-d-f-g-h)
    if (voiceKeys[key] && !e.metaKey && !e.ctrlKey) {
      const voiceId = voiceKeys[key]
      store.selectVoice(voiceId)
      audio.trigger(voiceId, store.voices[voiceId])
      return
    }

    // Step toggling (number keys 1-16 via shift)
    if (e.shiftKey && key >= '1' && key <= '9') {
      const stepIndex = parseInt(key) - 1
      store.toggleStep(store.selectedVoice, stepIndex)
      return
    }

    // Arrow keys - navigation
    if (key === 'arrowleft') {
      e.preventDefault()
      const prev = Math.max(0, store.currentStep - 1)
      store.setCurrentStep(prev as any)
      return
    }

    if (key === 'arrowright') {
      e.preventDefault()
      const next = Math.min(15, store.currentStep + 1)
      store.setCurrentStep(next as any)
      return
    }

    if (key === 'arrowup') {
      e.preventDefault()
      const voiceIds: VoiceId[] = ['bd', 'sd', 'lt', 'mt', 'ht', 'rs', 'cp', 'cb', 'cy', 'oh', 'ch', 'cl']
      const currentIndex = voiceIds.indexOf(store.selectedVoice)
      const prevIndex = Math.max(0, currentIndex - 1)
      store.selectVoice(voiceIds[prevIndex])
      return
    }

    if (key === 'arrowdown') {
      e.preventDefault()
      const voiceIds: VoiceId[] = ['bd', 'sd', 'lt', 'mt', 'ht', 'rs', 'cp', 'cb', 'cy', 'oh', 'ch', 'cl']
      const currentIndex = voiceIds.indexOf(store.selectedVoice)
      const nextIndex = Math.min(11, currentIndex + 1)
      store.selectVoice(voiceIds[nextIndex])
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

    // Swing control
    if (key === ',') {
      store.setSwing(store.swing - 1)
      return
    }

    if (key === '.') {
      store.setSwing(store.swing + 1)
      return
    }

    // Mute toggles (z-x-c-v-b-n-m)
    const muteKeys: VoiceId[] = ['bd', 'sd', 'lt', 'mt', 'ht', 'rs', 'cp']
    if (key >= 'z' && key <= 'm') {
      const muteIndex = ['z', 'x', 'c', 'v', 'b', 'n', 'm'].indexOf(key)
      if (muteIndex >= 0 && muteIndex < muteKeys.length) {
        store.toggleMute(muteKeys[muteIndex])
      }
      return
    }

    // Tab - next voice
    if (key === 'tab') {
      e.preventDefault()
      const voiceIds: VoiceId[] = ['bd', 'sd', 'lt', 'mt', 'ht', 'rs', 'cp', 'cb', 'cy', 'oh', 'ch', 'cl']
      const currentIndex = voiceIds.indexOf(store.selectedVoice)
      const nextIndex = (currentIndex + 1) % 12
      store.selectVoice(voiceIds[nextIndex])
      return
    }

    // Backtick - tap tempo
    if (key === '`') {
      sequencer.tapTempo()
      return
    }

    // Delete - clear pattern
    if (key === 'delete' || key === 'backspace') {
      if (e.shiftKey) {
        store.clearPattern()
      } else {
        store.clearVoiceSteps(store.selectedVoice)
      }
      return
    }

    // Enter - randomize
    if (key === 'enter') {
      store.randomizePattern()
      return
    }
  }

  // TrackPoint-style gesture handling
  let touchStartX = 0
  let touchStartY = 0
  let touchStartTime = 0

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      touchStartTime = performance.now()
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (e.changedTouches.length !== 1) return

    const deltaX = e.changedTouches[0].clientX - touchStartX
    const deltaY = e.changedTouches[0].clientY - touchStartY
    const deltaTime = performance.now() - touchStartTime

    // Swipe detection
    if (deltaTime < 300) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 50) {
          // Swipe right - next view
          swipeRight()
        } else if (deltaX < -50) {
          // Swipe left - prev view
          swipeLeft()
        }
      } else {
        if (deltaY > 50) {
          // Swipe down - stop
          sequencer.stop()
        } else if (deltaY < -50) {
          // Swipe up - play
          sequencer.toggle()
        }
      }
    }
  }

  function swipeLeft() {
    const views = ['performance', 'design', 'mix', 'pattern', 'module']
    const currentIndex = views.indexOf(store.currentView)
    const nextIndex = (currentIndex + 1) % views.length
    store.setView(views[nextIndex] as any)
  }

  function swipeRight() {
    const views = ['performance', 'design', 'mix', 'pattern', 'module']
    const currentIndex = views.indexOf(store.currentView)
    const prevIndex = (currentIndex - 1 + views.length) % views.length
    store.setView(views[prevIndex] as any)
  }

  // Mouse wheel - parameter adjustment
  function handleWheel(e: WheelEvent, paramKey: string, voiceId?: VoiceId) {
    e.preventDefault()
    const voice = voiceId || store.selectedVoice
    const currentValue = store.voices[voice].params[paramKey]?.value || 0
    const delta = e.deltaY > 0 ? -1 : 1
    store.setVoiceParam(voice, paramKey, currentValue + delta)
  }

  // Setup listeners
  function init() {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  // Cleanup
  function dispose() {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchend', handleTouchEnd)
  }

  return {
    init,
    dispose,
    handleWheel,
    voiceKeys,
    viewKeys
  }
}
