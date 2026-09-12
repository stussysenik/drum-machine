// SP-1200 Types — 1:1 Hardware Model (E-mu SP-1200, 1987)
// 32 Sounds (4 Banks of 8), 8 Output Channels, 7 Functional Modules

// === PADS & BANKS ===
// 32 sample slots: Bank A (0-7), Bank B (8-15), Bank C (16-23), Bank D (24-31)
export type PadId =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7     // Bank A (A1-A8)
  | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 // Bank B (B1-B8)
  | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 // Bank C (C1-C8)
  | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 // Bank D (D1-D8)

export type BankId = 'A' | 'B' | 'C' | 'D'
export type VoiceChannel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 // Channels 1 to 8

// Slider Performance Modes
export type PerformanceMode = 'tune_decay' | 'mix' | 'multi'

// 7 Hardware Modules
export type HardwareModule = 'sync' | 'sample' | 'disk' | 'setup' | 'master' | 'programming' | 'performance'

export interface PadConfig {
  id: PadId
  bank: BankId
  voiceChannel: VoiceChannel
  label: string          // 6-character sound name
  abbr: string           // 3-letter catalog abbreviation
  sampleId: string | null
  tune: number           // 0-31, 16 is nominal center
  decay: number          // 0-31, 16 is nominal center
  isDecayed: boolean     // true = slider affects decay, false = slider affects tuning
  level: number          // 0-100 (mix volume)
}

// === SAMPLES ===
export interface SampleData {
  id: string
  name: string
  buffer: AudioBuffer     // decoded audio
  duration: number        // seconds (max 2.50s per sample)
  sampleRate: number      // original rate
  isStock: boolean
  assignedPad: PadId | null
}

// === PATTERNS (SEGMENTS) & SONGS ===
export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15

export interface StepData {
  active: boolean
  velocity: number        // 0-127 (intensity)
  accent: boolean
  tie: boolean
}

export interface Pattern {
  index: number           // 0-99 (Segments 01-99)
  name: string
  steps: Record<VoiceChannel, StepData[]>
  length: number          // in measures
  timeSignature: [number, number] // e.g. [4, 4]
  bpm: number
  swing: number           // 50-71%
}

export interface SongEntry {
  patternIndex: number
  repeats: number
  mixOverride?: number    // Stored mix 1-8
  tempoOverride?: number
}

export interface Song {
  index: number           // 0-99 (Songs 01-99)
  name: string
  entries: SongEntry[]
}

// === SEQUENCER STATE ===
export type SequencerMode = 'pattern' | 'song'

export interface SequencerState {
  mode: SequencerMode
  activeModule: HardwareModule
  currentPattern: number
  currentSong: number
  currentStep: StepIndex
  playing: boolean
  recording: boolean
  bpm: number
  swing: number           // 50-71
  selectedPad: PadId
  selectedBank: BankId
  performanceMode: PerformanceMode
  mixVolume: number       // 0-100
  metronomeVolume: number // 0-100
}

// === LCD DISPLAY ===
export interface LcdState {
  line1: string
  line2: string
  memoryBars: number      // 0-10 (filled segments)
}

// === HARDWARE CONSTANTS ===
export const SP1200 = {
  BIT_DEPTH: 12,
  SAMPLE_RATE: 26041.6667, // 26.041666... Hz native
  MAX_SAMPLE_TIME: 10.04,  // seconds total (4 x 2.51s)
  MAX_SAMPLE_DURATION: 2.50, // max length for any single sample
  MAX_VOICES: 8,
  MAX_PATTERNS: 100,
  MAX_SONGS: 100,
  SWING_VALUES: [50, 54, 58, 62, 67, 71],
  BPM_MIN: 40,
  BPM_MAX: 240,
  PADS_COUNT: 32,
  BANK_SIZE: 8,
  BANKS: ['A', 'B', 'C', 'D'] as const,
  STEPS_PER_PATTERN: 16,
} as const

export function padToVoiceChannel(padId: PadId): VoiceChannel {
  return (padId % 8) as VoiceChannel
}

// === ADOPTION LESSONS & SONG WORKBENCH (Phase 7) ===

export type LessonCapability = 'playback' | 'recording' | 'swing' | 'sampling' | 'song-chain'

export type LessonPhase = 0 | 1 | 2 | 3 | 4

export type LessonSetup = 'none' | 'new-practice-project' | 'current-project-optional'

export type LessonReset = 'restore-study-snapshot' | 'none'

export interface LessonStep {
  id: string
  label: string
  detail: string
}

export interface LessonDefinition {
  id: string
  phase: LessonPhase
  title: string
  durationMinutes: number
  capability: LessonCapability[]
  intent: string
  setup: LessonSetup
  steps: LessonStep[]
  reset: LessonReset
}

export type LessonStatus = 'available' | 'blocked' | 'in-progress' | 'completed'

export interface LessonProgress {
  lessonId: string
  status: LessonStatus
  completedSteps: string[]
  startedAt: number | null
  completedAt: number | null
}

export type ProjectSource = 'user' | 'study'

export interface ProjectMetadata {
  schemaVersion: number
  projectName: string
  source: ProjectSource
  studyId: string | null
  lessonProgress: LessonProgress[]
  lastOpenedAt: number
}

export interface StudyDefinition {
  id: string
  version: string
  title: string
  description: string
  bpm: number
  swing: number
  patterns: StudyPattern[]
  song: StudySong | null
}

export interface StudyPattern {
  index: number
  name: string
  length: number
  steps: Record<VoiceChannel, boolean[]>
}

export interface StudySong {
  entries: Array<{ patternIndex: number; repeats: number }>
}

export interface SongWorkbenchState {
  selectedSong: number
  playState: 'stopped' | 'playing'
  pendingSong: number | null
  activeEntryIndex: number | null
  entries: Array<{
    position: number
    patternIndex: number
    repeats: number
    mixOverride?: number
    tempoOverride?: number
  }>
  layers: Array<{
    channel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    pads: PadId[]
    activeSteps: number
    sampleLabel: string | null
  }>
}

export const PROJECT_SCHEMA_VERSION = 1
