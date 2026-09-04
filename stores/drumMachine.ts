// SP-1200 Drum Machine State
// Parametric law: every property is a named parameter

import { defineStore } from 'pinia'
import type { VoiceId, DrumVoice, Pattern, Step, StepIndex, ViewId, SignalChain, SignalModule, ModuleType } from '~/types'

export const useDrumMachineStore = defineStore('drumMachine', {
  state: () => ({
    // Hardware constraints (SP-1200 physical limits)
    hardware: {
      bitDepth: 12 as const,
      sampleRate: 26040 as const,
      maxSampleTime: 10,
      maxVoices: 12,
      filterType: 'ssm2044' as const
    },

    // Current view/POV
    currentView: 'performance' as ViewId,

    // Performance state
    playing: false,
    currentStep: 0 as StepIndex,
    bpm: 90,
    swing: 52, // SP-1200: 50-66 range

    // Selected targets
    selectedVoice: 'bd' as VoiceId,
    selectedPattern: 0,

    // Record/quantize
    recordMode: false,
    quantize: true,

    // Voices - all 12 SP-1200 voices
    voices: {
      bd: createVoice('bd', 'Bass Drum'),
      sd: createVoice('sd', 'Snare'),
      lt: createVoice('lt', 'Low Tom'),
      mt: createVoice('mt', 'Mid Tom'),
      ht: createVoice('ht', 'High Tom'),
      rs: createVoice('rs', 'Rimshot'),
      cp: createVoice('cp', 'Clap'),
      cb: createVoice('cb', 'Cowbell'),
      cy: createVoice('cy', 'Cymbal'),
      oh: createVoice('oh', 'Open Hat'),
      ch: createVoice('ch', 'Closed Hat'),
      cl: createVoice('cl', 'Click')
    } as Record<VoiceId, DrumVoice>,

    // Pattern - 16 steps x 12 voices
    pattern: {
      id: 'P001',
      name: 'PATTERN 01',
      length: 16 as const,
      swing: 52,
      bpm: 90,
      steps: createEmptySteps()
    } as Pattern,

    // Signal chains per voice
    signalChains: createSignalChains() as Record<VoiceId, SignalChain>
  }),

  getters: {
    // Active voices (not muted)
    activeVoices: (state) => {
      return Object.entries(state.voices)
        .filter(([, voice]) => !voice.muted)
        .map(([id]) => id as VoiceId)
    },

    // Soloed voices
    soloedVoices: (state) => {
      return Object.entries(state.voices)
        .filter(([, voice]) => voice.solo)
        .map(([id]) => id as VoiceId)
    },

    // Current pattern steps for selected voice
    currentVoiceSteps: (state) => {
      return state.pattern.steps[state.selectedVoice]
    },

    // Is any voice soloed
    hasSolo: (state) => {
      return Object.values(state.voices).some(v => v.solo)
    },

    // Step duration in ms (with swing)
    stepDuration: (state) => {
      const baseStep = (60000 / state.bpm) / 4 // 16th notes
      return baseStep
    },

    // Swing offset for even steps
    swingOffset: (state) => {
      return ((state.swing - 50) / 50) * (60000 / state.bpm) / 6
    }
  },

  actions: {
    // View navigation
    setView(view: ViewId) {
      this.currentView = view
    },

    // Transport control
    play() {
      this.playing = true
    },

    stop() {
      this.playing = false
      this.currentStep = 0
    },

    togglePlay() {
      this.playing = !this.playing
      if (!this.playing) this.currentStep = 0
    },

    // Step sequencer
    advanceStep() {
      const maxStep = this.pattern.length - 1
      if (this.currentStep >= maxStep) {
        this.currentStep = 0
      } else {
        this.currentStep = (this.currentStep + 1) as StepIndex
      }
    },

    setCurrentStep(step: StepIndex) {
      this.currentStep = step
    },

    // Pattern editing
    toggleStep(voiceId: VoiceId, stepIndex: number) {
      const step = this.pattern.steps[voiceId][stepIndex]
      step.active = !step.active
    },

    setStepVelocity(voiceId: VoiceId, stepIndex: number, velocity: number) {
      this.pattern.steps[voiceId][stepIndex].velocity = Math.max(0, Math.min(100, velocity))
    },

    toggleAccent(voiceId: VoiceId, stepIndex: number) {
      this.pattern.steps[voiceId][stepIndex].accent = !this.pattern.steps[voiceId][stepIndex].accent
    },

    toggleSlide(voiceId: VoiceId, stepIndex: number) {
      this.pattern.steps[voiceId][stepIndex].slide = !this.pattern.steps[voiceId][stepIndex].slide
    },

    // Voice selection
    selectVoice(voiceId: VoiceId) {
      this.selectedVoice = voiceId
    },

    // Voice parameters
    setVoiceParam(voiceId: VoiceId, paramKey: string, value: number) {
      const voice = this.voices[voiceId]
      if (voice && voice.params[paramKey]) {
        voice.params[paramKey].value = Math.max(
          voice.params[paramKey].min,
          Math.min(voice.params[paramKey].max, value)
        )
      }
    },

    // Voice mute/solo
    toggleMute(voiceId: VoiceId) {
      this.voices[voiceId].muted = !this.voices[voiceId].muted
    },

    toggleSolo(voiceId: VoiceId) {
      this.voices[voiceId].solo = !this.voices[voiceId].solo
    },

    // BPM
    setBpm(bpm: number) {
      this.bpm = Math.max(60, Math.min(180, bpm))
      this.pattern.bpm = this.bpm
    },

    // Swing
    setSwing(swing: number) {
      this.swing = Math.max(50, Math.min(75, swing))
      this.pattern.swing = this.swing
    },

    // Signal chain
    toggleModule(voiceId: VoiceId, moduleId: string) {
      const chain = this.signalChains[voiceId]
      const module = chain.modules.find(m => m.id === moduleId)
      if (module) {
        module.enabled = !module.enabled
      }
    },

    setModuleParam(voiceId: VoiceId, moduleId: string, paramIndex: number, value: number) {
      const chain = this.signalChains[voiceId]
      const module = chain.modules.find(m => m.id === moduleId)
      if (module && module.params[paramIndex]) {
        module.params[paramIndex].value = Math.max(
          module.params[paramIndex].min,
          Math.min(module.params[paramIndex].max, value)
        )
      }
    },

    reorderModules(voiceId: VoiceId, fromIndex: number, toIndex: number) {
      const chain = this.signalChains[voiceId]
      const [moved] = chain.modules.splice(fromIndex, 1)
      chain.modules.splice(toIndex, 0, moved)
      chain.modules.forEach((m, i) => { m.order = i })
    },

    // Pattern management
    clearPattern() {
      this.pattern.steps = createEmptySteps()
    },

    clearVoiceSteps(voiceId: VoiceId) {
      this.pattern.steps[voiceId] = createVoiceSteps()
    },

    randomizePattern() {
      Object.keys(this.pattern.steps).forEach(voiceId => {
        this.pattern.steps[voiceId as VoiceId].forEach(step => {
          step.active = Math.random() > 0.8
          step.velocity = Math.floor(Math.random() * 50) + 50
          step.accent = Math.random() > 0.9
        })
      })
    }
  }
})

// === FACTORY FUNCTIONS ===

function createVoice(id: VoiceId, label: string): DrumVoice {
  return {
    id,
    label,
    params: {
      tune: { id: 'tune', label: 'Tune', value: 50, min: 0, max: 100, step: 1 },
      decay: { id: 'decay', label: 'Decay', value: 50, min: 0, max: 100, step: 1 },
      attack: { id: 'attack', label: 'Attack', value: 0, min: 0, max: 100, step: 1 },
      snappy: { id: 'snappy', label: 'Snappy', value: 50, min: 0, max: 100, step: 1 },
      level: { id: 'level', label: 'Level', value: 80, min: 0, max: 100, step: 1 },
      drive: { id: 'drive', label: 'Drive', value: 20, min: 0, max: 100, step: 1 },
      filter: { id: 'filter', label: 'Filter', value: 70, min: 0, max: 100, step: 1 },
      resonance: { id: 'resonance', label: 'Res', value: 30, min: 0, max: 100, step: 1 }
    },
    output: 'stereo',
    muted: false,
    solo: false
  }
}

function createVoiceSteps(): Step[] {
  return Array.from({ length: 16 }, (_, i) => ({
    index: i as StepIndex,
    active: false,
    velocity: 80,
    accent: false,
    slide: false
  }))
}

function createEmptySteps(): Record<VoiceId, Step[]> {
  const voices: VoiceId[] = ['bd', 'sd', 'lt', 'mt', 'ht', 'rs', 'cp', 'cb', 'cy', 'oh', 'ch', 'cl']
  const result = {} as Record<VoiceId, Step[]>
  voices.forEach(voiceId => {
    result[voiceId] = createVoiceSteps()
  })
  return result
}

function createSignalChains(): Record<VoiceId, SignalChain> {
  const voices: VoiceId[] = ['bd', 'sd', 'lt', 'mt', 'ht', 'rs', 'cp', 'cb', 'cy', 'oh', 'ch', 'cl']
  const result = {} as Record<VoiceId, SignalChain>
  
  voices.forEach(voiceId => {
    result[voiceId] = {
      voiceId,
      modules: [
        {
          id: `${voiceId}-bitcrusher`,
          type: 'bitcrusher',
          enabled: true,
          order: 0,
          params: [
            { id: 'bits', label: 'Bits', value: 12, min: 4, max: 16, step: 1 },
            { id: 'rate', label: 'Rate', value: 100, min: 1, max: 100, step: 1 }
          ],
          inputs: [],
          outputs: [`${voiceId}-drive`]
        },
        {
          id: `${voiceId}-drive`,
          type: 'drive',
          enabled: true,
          order: 1,
          params: [
            { id: 'amount', label: 'Amount', value: 20, min: 0, max: 100, step: 1 }
          ],
          inputs: [`${voiceId}-bitcrusher`],
          outputs: [`${voiceId}-filter`]
        },
        {
          id: `${voiceId}-filter`,
          type: 'filter',
          enabled: true,
          order: 2,
          params: [
            { id: 'cutoff', label: 'Cutoff', value: 70, min: 0, max: 100, step: 1 },
            { id: 'res', label: 'Res', value: 30, min: 0, max: 100, step: 1 }
          ],
          inputs: [`${voiceId}-drive`],
          outputs: []
        }
      ]
    }
  })
  
  return result
}
