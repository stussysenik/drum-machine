// SP-1200 Hardware Emulation Types
// All parameters follow the parametric law: name, type, domain, value

// === PHYSICAL CONSTRAINTS ===
// SP-1200: 12-bit DAC, 26.04kHz sample rate, 10 second total sample time
// SSM2044 analog filters, 12 voices max

export type BitDepth = 12 | 16 | 24
export type SampleRate = 26040 | 44100 | 48000

export interface HardwareConstraints {
  bitDepth: BitDepth        // SP-1200: 12-bit
  sampleRate: SampleRate    // SP-1200: 26.04kHz
  maxSampleTime: number     // SP-1200: 10 seconds total
  maxVoices: number         // SP-1200: 12 voices
  filterType: 'ssm2044' | 'none'
}

// === DRUM VOICE ===
export type VoiceId = 'bd' | 'sd' | 'lt' | 'mt' | 'ht' | 'rs' | 'cp' | 'cb' | 'cy' | 'oh' | 'ch' | 'cl'

export interface VoiceParam {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
}

export interface DrumVoice {
  id: VoiceId
  label: string
  params: {
    tune: VoiceParam       // 0-100 (pitch, affects drive)
    decay: VoiceParam      // 0-100 (envelope decay)
    attack: VoiceParam     // 0-100 (attack shape)
    snappy: VoiceParam     // 0-100 (snare snap amount)
    level: VoiceParam      // 0-100 (output level)
    drive: VoiceParam      // 0-100 (analog drive)
    filter: VoiceParam     // 0-100 (SSM2044 filter freq)
    resonance: VoiceParam  // 0-100 (filter resonance)
  }
  output: 'stereo' | 'individual'
  muted: boolean
  solo: boolean
}

// === STEP SEQUENCER ===
export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15

export interface Step {
  index: StepIndex
  active: boolean
  velocity: number    // 0-100 (accent level)
  accent: boolean
  slide: boolean
}

export interface Pattern {
  id: string
  name: string
  steps: Record<VoiceId, Step[]>
  length: 8 | 12 | 16
  swing: number       // 50-75 (SP-1200: 50-66)
  bpm: number         // 60-180
}

// === SIGNAL CHAIN ===
export type ModuleType = 'bitcrusher' | 'drive' | 'filter' | 'compressor' | 'delay' | 'reverb'

export interface SignalModule {
  id: string
  type: ModuleType
  enabled: boolean
  order: number
  params: VoiceParam[]
  inputs: string[]    // module IDs
  outputs: string[]   // module IDs
}

export interface SignalChain {
  voiceId: VoiceId
  modules: SignalModule[]
}

// === PERFORMANCE ===
export interface Performance {
  patternId: string
  playing: boolean
  currentStep: StepIndex
  selectedVoice: VoiceId
  selectedPattern: number
  recordMode: boolean
  quantize: boolean
}

// === VIEW/POV ===
export type ViewId = 'performance' | 'design' | 'mix' | 'pattern' | 'module'

export interface AppState {
  currentView: ViewId
  hardware: HardwareConstraints
  voices: Record<VoiceId, DrumVoice>
  pattern: Pattern
  performance: Performance
  signalChains: Record<VoiceId, SignalChain>
}
