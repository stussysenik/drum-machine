// SP-1200 Step Sequencer
// 16 steps, swing timing, trigger scheduling

import type { VoiceId, StepIndex } from '~/types'

export function useSequencer() {
  const store = useDrumMachineStore()
  const audio = useAudioEngine()
  
  let timer: number | null = null
  let nextNoteTime = 0
  let current16thNote = 0
  const lookahead = 25 // ms - how often to call scheduler
  const scheduleAheadTime = 0.1 // s - how far ahead to schedule

  // Calculate step duration with swing
  function getStepDuration(stepIndex: number): number {
    const baseStep = (60 / store.bpm) / 4 // 16th note duration
    // Apply swing to even steps (SP-1200 behavior)
    if (stepIndex % 2 === 1) {
      return baseStep + store.swingOffset
    }
    return baseStep - store.swingOffset
  }

  // Schedule a note
  function scheduleNote(step: StepIndex, time: number) {
    // Trigger all active voices at this step
    Object.entries(store.pattern.steps).forEach(([voiceId, steps]) => {
      const stepData = steps[step]
      const voice = store.voices[voiceId as VoiceId]
      
      if (stepData.active && !voice.muted && (!store.hasSolo || voice.solo)) {
        audio.trigger(voiceId as VoiceId, voice)
      }
    })
  }

  // Scheduler - runs on interval
  function scheduler() {
    if (!store.playing) return

    while (nextNoteTime < performance.now() / 1000 + scheduleAheadTime) {
      scheduleNote(current16thNote as StepIndex, nextNoteTime)
      
      // Advance to next step
      const duration = getStepDuration(current16thNote)
      nextNoteTime += duration
      current16thNote = (current16thNote + 1) % store.pattern.length
      
      // Update store for visual feedback
      store.setCurrentStep(current16thNote as StepIndex)
    }
  }

  // Start sequencer
  function start() {
    if (timer) return
    
    audio.init()
    current16thNote = 0
    nextNoteTime = performance.now() / 1000
    store.play()
    
    timer = window.setInterval(scheduler, lookahead)
  }

  // Stop sequencer
  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    store.stop()
  }

  // Toggle play
  function toggle() {
    if (store.playing) {
      stop()
    } else {
      start()
    }
  }

  // Tap tempo
  let tapTimes: number[] = []
  function tapTempo() {
    const now = performance.now()
    tapTimes.push(now)
    
    // Keep only last 4 taps
    if (tapTimes.length > 4) {
      tapTimes = tapTimes.slice(-4)
    }
    
    if (tapTimes.length >= 2) {
      const intervals: number[] = []
      for (let i = 1; i < tapTimes.length; i++) {
        intervals.push(tapTimes[i] - tapTimes[i - 1])
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const bpm = Math.round(60000 / avgInterval)
      store.setBpm(bpm)
    }
  }

  // Cleanup
  function dispose() {
    stop()
  }

  return {
    start,
    stop,
    toggle,
    tapTempo,
    dispose
  }
}
