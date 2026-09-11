// SP-1200 State Store — UI state ONLY, never audio data
// 1:1 Hardware Model: 32 Sounds, 4 Banks (A, B, C, D), 8 Channel Sliders, 7 Modules

import { defineStore } from 'pinia'
import type {
  PadId,
  BankId,
  VoiceChannel,
  Pattern,
  Song,
  SongEntry,
  StepData,
  StepIndex,
  SequencerMode,
  PerformanceMode,
  HardwareModule,
  SampleData,
  LcdState,
} from '~/types'
import { SP1200 } from '~/types'

// Default sound names across Bank A-D (standard factory mapping)
const defaultSoundLabels: Record<number, { name: string; abbr: string }> = {
  0: { name: 'BASS-1', abbr: 'BA1' },
  1: { name: 'SNARE1', abbr: 'SN1' },
  2: { name: 'TOM-LO', abbr: 'TML' },
  3: { name: 'TOM-MD', abbr: 'TMM' },
  4: { name: 'TOM-HI', abbr: 'TMH' },
  5: { name: 'RIM-SH', abbr: 'RIM' },
  6: { name: 'CLAP-1', abbr: 'CLP' },
  7: { name: 'HI-HAT', abbr: 'HAT' },

  8: { name: 'O-HAT1', abbr: 'OH1' },
  9: { name: 'COWBL1', abbr: 'CB1' },
  10: { name: 'CLAVE1', abbr: 'CLV' },
  11: { name: 'CRASH1', abbr: 'CY1' },
  12: { name: 'PERC-1', abbr: 'PC1' },
  13: { name: 'PERC-2', abbr: 'PC2' },
  14: { name: 'PERC-3', abbr: 'PC3' },
  15: { name: 'PERC-4', abbr: 'PC4' },

  16: { name: 'BASS-2', abbr: 'BA2' },
  17: { name: 'SNARE2', abbr: 'SN2' },
  18: { name: 'SHAKER', abbr: 'SHK' },
  19: { name: 'CONGA1', abbr: 'CG1' },
  20: { name: 'CONGA2', abbr: 'CG2' },
  21: { name: 'TAMB-1', abbr: 'TB1' },
  22: { name: 'FX-HIT', abbr: 'FX1' },
  23: { name: 'RIDE-1', abbr: 'RD1' },

  24: { name: 'USER-1', abbr: 'US1' },
  25: { name: 'USER-2', abbr: 'US2' },
  26: { name: 'USER-3', abbr: 'US3' },
  27: { name: 'USER-4', abbr: 'US4' },
  28: { name: 'USER-5', abbr: 'US5' },
  29: { name: 'USER-6', abbr: 'US6' },
  30: { name: 'USER-7', abbr: 'US7' },
  31: { name: 'USER-8', abbr: 'US8' },
}

export const useDrumMachineStore = defineStore('drumMachine', {
  state: () => ({
    // === HARDWARE STATUS ===
    activeModule: 'performance' as HardwareModule,
    performanceMode: 'mix' as PerformanceMode, // 'tune_decay' | 'mix' | 'multi'
    selectedBank: 'A' as BankId,               // 'A' | 'B' | 'C' | 'D'
    selectedPad: 0 as PadId,

    // Master Pots
    mixVolume: 85,
    metronomeVolume: 50,

    // === SEQUENCER ===
    playing: false,
    recording: false,
    mode: 'pattern' as SequencerMode, // 'pattern' (Segment) | 'song'
    currentPattern: 0,
    currentSong: 0,
    currentStep: 0 as StepIndex,
    bpm: 92.4,
    swing: 54, // 50, 54, 58, 62, 67, 71

    // 8 Channel Sliders (0-100, 50 is center)
    faders: [85, 80, 75, 75, 75, 70, 65, 80] as number[],

    // === 32 SOUND PADS (8 pads x 4 banks) ===
    padSettings: Array.from({ length: 32 }, (_, i) => ({
      id: i as PadId,
      bank: (['A', 'B', 'C', 'D'][Math.floor(i / 8)]) as BankId,
      voiceChannel: (i % 8) as VoiceChannel,
      label: defaultSoundLabels[i]?.name ?? `SND-${i + 1}`,
      abbr: defaultSoundLabels[i]?.abbr ?? `S${i + 1}`,
      sampleId: null as string | null,
      tune: 16,        // 0-31, 16 is nominal center
      decay: 16,       // 0-31
      isDecayed: i % 8 === 7 || i % 8 === 3, // cymbals default to decay
      gain: 80,        // 0-100
    })),

    // === PATTERNS (100 Segments) ===
    patterns: Array.from({ length: 100 }, (_, i) => createPattern(i)),

    // === SONGS (100 Songs) ===
    songs: Array.from({ length: 100 }, (_, i) => createSong(i)),

    // === SAMPLES & MEMORY ===
    samples: [] as SampleData[],
    totalMemorySeconds: 0,

    // === 2x16 LCD DISPLAY ===
    lcd: {
      line1: 'SEGMENT: 01',
      line2: 'BPM: 092.4',
      memoryBars: 0,
    } as LcdState,

    // Keypad entry buffer
    keypadBuffer: '',
  }),

  getters: {
    activePattern: (state): Pattern => state.patterns[state.currentPattern],

    activePatternSteps: (state): Record<VoiceChannel, StepData[]> =>
      state.patterns[state.currentPattern].steps,

    selectedPadSampleId: (state): string | null =>
      state.padSettings[state.selectedPad].sampleId,

    // Returns array of 8 pad IDs for the active Bank
    visibleBankPads: (state): PadId[] => {
      const bankIndex = ['A', 'B', 'C', 'D'].indexOf(state.selectedBank)
      const start = (bankIndex >= 0 ? bankIndex : 0) * 8
      return Array.from({ length: 8 }, (_, i) => (start + i) as PadId)
    },

    remainingMemory: (state): number =>
      Math.max(0, SP1200.MAX_SAMPLE_TIME - state.totalMemorySeconds),

    getSample: (state) => (id: string): SampleData | undefined =>
      state.samples.find(s => s.id === id),
  },

  actions: {
    // === TRANSPORT ===
    play() {
      this.playing = true
      this.updateLcd()
    },
    stop() {
      this.playing = false
      this.currentStep = 0
      this.updateLcd()
    },
    togglePlay() {
      if (this.playing) {
        this.stop()
      } else {
        this.play()
      }
    },
    toggleRecord() {
      this.recording = !this.recording
    },

    // === STEP SEQUENCER ===
    setCurrentStep(step: StepIndex) {
      this.currentStep = step
    },

    toggleStep(voiceChannel: VoiceChannel, stepIndex: number) {
      const step = this.patterns[this.currentPattern].steps[voiceChannel][stepIndex]
      step.active = !step.active
    },

    // === PAD & BANK SELECTION ===
    selectPad(padId: PadId) {
      this.selectedPad = padId
      const bankIdx = Math.floor(padId / 8)
      this.selectedBank = ['A', 'B', 'C', 'D'][bankIdx] as BankId
      const padConfig = this.padSettings[padId]
      this.setLcd(
        `SOUND: ${padConfig.label}`,
        `CH:${padConfig.voiceChannel + 1} TN:${padConfig.tune} LV:${padConfig.gain}`
      )
    },

    selectBank(bank: BankId) {
      this.selectedBank = bank
      const bankIdx = ['A', 'B', 'C', 'D'].indexOf(bank)
      this.selectedPad = (bankIdx * 8) as PadId
      this.setLcd(`BANK ${bank} SELECTED`, `SOUNDS ${bank}1 - ${bank}8`)
      setTimeout(() => this.updateLcd(), 1200)
    },

    cycleBank() {
      const order: BankId[] = ['A', 'B', 'C', 'D']
      const nextIdx = (order.indexOf(this.selectedBank) + 1) % 4
      this.selectBank(order[nextIdx])
    },

    // === MODE CYCLING ===
    cyclePerformanceMode() {
      if (this.performanceMode === 'tune_decay') {
        this.performanceMode = 'mix'
        this.setLcd('MODE: MIX', 'SLIDERS: LEVELS')
      } else if (this.performanceMode === 'mix') {
        this.performanceMode = 'multi'
        this.setLcd('MODE: MULTI-MODE', 'PADS: PITCH SPREAD')
      } else {
        this.performanceMode = 'tune_decay'
        this.setLcd('MODE: TUNE/DECAY', 'SLIDERS: PITCH/DK')
      }
      setTimeout(() => this.updateLcd(), 1200)
    },

    setHardwareModule(mod: HardwareModule) {
      this.activeModule = mod
      switch (mod) {
        case 'sync':
          this.setLcd('SYNC MODULE', '1:INT 2:MIDI 3:SMP')
          break
        case 'sample':
          this.setLcd('SAMPLE MODULE', '1:VU 4:THRS 7:ARM')
          break
        case 'disk':
          this.setLcd('DISK MODULE', '1:LOAD 2:SAVE 3:CAT')
          break
        case 'setup':
          this.setLcd('SET-UP FUNCTION?', '(11 - 23)')
          break
        default:
          this.updateLcd()
      }
    },

    // === CHANNEL FADER UPDATES ===
    setFader(channelIndex: number, value: number) {
      this.faders[channelIndex] = Math.max(0, Math.min(100, value))
      const padId = this.visibleBankPads[channelIndex]
      const pad = this.padSettings[padId]

      if (this.performanceMode === 'mix') {
        pad.gain = this.faders[channelIndex]
        const bar = '█'.repeat(Math.round(value / 10))
        this.setLcd(`CH ${channelIndex + 1} MIX LEVEL`, `[${bar.padEnd(10, '░')}] ${value}%`)
      } else if (this.performanceMode === 'tune_decay') {
        const tuneVal = Math.round((value / 100) * 31)
        if (pad.isDecayed) {
          pad.decay = tuneVal
          this.setLcd(`CH ${channelIndex + 1} DECAY`, `VAL: ${tuneVal} / 31`)
        } else {
          pad.tune = tuneVal
          this.setLcd(`CH ${channelIndex + 1} TUNE`, `VAL: ${tuneVal - 16} ST`)
        }
      }
    },

    // === KEYPAD & LCD ENTRY ===
    pressKeypad(key: string) {
      if (key === 'ENTER') {
        if (this.keypadBuffer) {
          const fnNum = parseInt(this.keypadBuffer, 10)
          this.handleFunctionCode(fnNum)
          this.keypadBuffer = ''
        } else {
          this.updateLcd()
        }
      } else if (key === 'NO') {
        this.keypadBuffer = ''
        this.updateLcd()
      } else if (key === 'YES') {
        this.setLcd('COMMAND CONFIRMED', 'EXECUTING...')
        setTimeout(() => this.updateLcd(), 1000)
      } else {
        this.keypadBuffer += key
        this.setLcd(`KEYPAD ENTRY:`, `${this.keypadBuffer}_`)
      }
    },

    handleFunctionCode(code: number) {
      if (code === 18) {
        this.performanceMode = 'tune_decay'
        this.setLcd('SET-UP 18: DECAY', '1:TUNE 2:DECAY')
      } else if (code === 11) {
        this.performanceMode = 'multi'
        this.setLcd('SET-UP 11: MULTI', 'PITCH SPREAD ON')
      } else if (code === 12) {
        this.performanceMode = 'multi'
        this.setLcd('SET-UP 12: MULTI', 'LEVEL SPREAD ON')
      } else if (code === 13) {
        this.performanceMode = 'mix'
        this.setLcd('SET-UP 13: EXIT', 'MULTI MODE OFF')
      } else if (code === 15) {
        this.setLcd('STORE MIX (1-8)', 'SELECT REGISTER')
      } else if (code === 23) {
        this.setLcd('SPECIAL FUNCTIONS', '11-23 CATALOG')
      } else {
        this.setLcd(`FUNCTION #${code}`, 'SELECTED')
        setTimeout(() => this.updateLcd(), 1500)
      }
    },

    // === SAMPLES ===
    addSample(sample: SampleData) {
      this.samples.push(sample)
      this.totalMemorySeconds += sample.duration
      this.updateLcd()
    },

    assignSampleToPad(sampleId: string, padId: PadId) {
      this.padSettings[padId].sampleId = sampleId
    },

    // === TEMPO ===
    setBpm(bpm: number) {
      this.bpm = Math.max(SP1200.BPM_MIN, Math.min(SP1200.BPM_MAX, bpm))
      this.patterns[this.currentPattern].bpm = this.bpm
      this.updateLcd()
    },

    // === LCD RENDER ===
    setLcd(line1: string, line2: string) {
      this.lcd.line1 = line1.padEnd(16, ' ').slice(0, 16)
      this.lcd.line2 = line2.padEnd(16, ' ').slice(0, 16)
    },

    updateLcd() {
      const modeStr = this.mode === 'song' ? 'SONG' : 'SEGMENT'
      const numStr = String((this.mode === 'song' ? this.currentSong : this.currentPattern) + 1).padStart(2, '0')
      const bpmStr = this.bpm.toFixed(1).padStart(5, ' ')
      const memSecs = (SP1200.MAX_SAMPLE_TIME - this.totalMemorySeconds).toFixed(1)
      this.lcd.line1 = `${modeStr}: ${numStr}  ${bpmStr}`.slice(0, 16)
      this.lcd.line2 = `MEM: ${memSecs}s [BANK ${this.selectedBank}]`.slice(0, 16)
    },
  },
})

function createSteps(): StepData[] {
  return Array.from({ length: 16 }, () => ({
    active: false,
    velocity: 100,
    accent: false,
    tie: false,
  }))
}

function createPattern(index: number): Pattern {
  const steps = {} as Record<VoiceChannel, StepData[]>
  for (let v = 0; v < 8; v++) {
    steps[v as VoiceChannel] = createSteps()
  }
  return {
    index,
    name: `SEGMENT ${String(index + 1).padStart(2, '0')}`,
    steps,
    length: 2,
    timeSignature: [4, 4],
    bpm: 92.4,
    swing: 54,
  }
}

function createSong(index: number): Song {
  return {
    index,
    name: `SONG ${String(index + 1).padStart(2, '0')}`,
    entries: [],
  }
}
