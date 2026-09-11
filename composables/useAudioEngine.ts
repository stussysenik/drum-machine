// SP-1200 Audio Engine — Vanilla TS, NO Vue reactivity
// Manages: AudioContext, AudioBuffers, AudioWorkletNode, Tone.js clock, voice assignment
// UI calls this via thin API. Audio data never enters Pinia.
//
// SINGLETON: one AudioContext, one worklet chain, shared across all composables.

import type { PadId, VoiceChannel } from '~/types'
import { SP1200, padToVoiceChannel } from '~/types'

// Module-level singleton state
let audioCtx: AudioContext | null = null
let workletNode: AudioWorkletNode | null = null
let masterGain: GainNode | null = null
let ssmFilter: BiquadFilterNode | null = null

// Sample storage: padId → { buffer, sampleRate, sampleData: Float32Array }
const sampleStore: Map<PadId, { buffer: AudioBuffer, sampleRate: number, sampleData: Float32Array }> = new Map()

// Per-pad pitch (0.2–2.0)
const padPitch: Map<PadId, number> = new Map()
// Per-pad gain (0–1)
const padGain: Map<PadId, number> = new Map()

// Initialize AudioContext + AudioWorklet
async function init() {
  if (audioCtx) return

  audioCtx = new AudioContext({
    sampleRate: 48000,  // Browser native; worklet handles drop-sample to 26.04kHz
    latencyHint: 'interactive'
  })

  // Load the AudioWorklet processor
  await audioCtx.audioWorklet.addModule('/sp1200-processor.js')

  workletNode = new AudioWorkletNode(audioCtx, 'sp1200-processor')

  // Master gain
  masterGain = audioCtx.createGain()
  masterGain.gain.value = 0.85

  // SSM2044 filter emulation (Biquad approximation for MVP)
  ssmFilter = audioCtx.createBiquadFilter()
  ssmFilter.type = 'lowpass'
  ssmFilter.frequency.value = 6500
  ssmFilter.Q.value = 2.5

  // Signal chain: worklet → SSM filter → master gain → output
  workletNode.connect(ssmFilter)
  ssmFilter.connect(masterGain)
  masterGain.connect(audioCtx.destination)

  // Initialize default pitch/gain for all pads
  for (let i = 0; i < SP1200.PADS_COUNT; i++) {
    padPitch.set(i as PadId, 1.0)
    padGain.set(i as PadId, 1.0)
  }
}

// Resume context (required after user gesture)
async function resume() {
  if (audioCtx?.state === 'suspended') {
    await audioCtx.resume()
  }
}

// Load a sample's AudioBuffer + raw data into a pad
function loadSampleToPad(padId: PadId, buffer: AudioBuffer) {
  const sampleData = buffer.getChannelData(0).slice() // copy for transferable
  const entry = { buffer, sampleRate: buffer.sampleRate, sampleData }
  sampleStore.set(padId, entry)

  // Pre-send to worklet
  const voiceChannel = padToVoiceChannel(padId)
  if (workletNode) {
    workletNode.port.postMessage({
      type: 'loadSample',
      voiceChannel,
      sampleData,
      sampleRate: buffer.sampleRate,
    })
  }
}

// Remove a sample from a pad
function unloadSample(padId: PadId) {
  sampleStore.delete(padId)
}

// Set pitch for a pad (0.2–2.0)
function setPadPitch(padId: PadId, pitch: number) {
  padPitch.set(padId, Math.max(0.2, Math.min(2.0, pitch)))
}

// Set gain for a pad (0–1)
function setPadGain(padId: PadId, gain: number) {
  padGain.set(padId, Math.max(0, Math.min(1, gain)))
}

// Trigger a pad — sends sample data to the worklet
function triggerPad(padId: PadId) {
  if (!workletNode) return

  const entry = sampleStore.get(padId)
  if (!entry) return

  const voiceChannel = padToVoiceChannel(padId)
  const pitch = padPitch.get(padId) ?? 1.0
  const gain = padGain.get(padId) ?? 1.0

  // Send the Float32Array to the worklet (structured-clone safe)
  workletNode.port.postMessage({
    type: 'trigger',
    voiceChannel,
    sampleData: entry.sampleData,
    sampleRate: entry.sampleRate,
    pitch,
    gain,
  })
}

// Stop a voice channel
function stopVoice(voiceChannel: VoiceChannel) {
  workletNode?.port.postMessage({ type: 'stop', voiceChannel })
}

// Stop all voices
function stopAll() {
  workletNode?.port.postMessage({ type: 'stopAll' })
}

// Decode an audio file/blob to AudioBuffer
async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  if (!audioCtx) await init()
  const arrayBuffer = await file.arrayBuffer()
  return await audioCtx!.decodeAudioData(arrayBuffer)
}

// Decode from a raw ArrayBuffer
async function decodeAudioBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
  if (!audioCtx) await init()
  return await audioCtx!.decodeAudioData(arrayBuffer)
}

// Get current AudioContext time
function currentTime(): number {
  return audioCtx?.currentTime ?? 0
}

// Get sample duration for a pad
function getSampleDuration(padId: PadId): number {
  return sampleStore.get(padId)?.buffer.duration ?? 0
}

// Check if a pad has a sample loaded
function hasSample(padId: PadId): boolean {
  return sampleStore.has(padId)
}

// Get total memory used (seconds)
function getTotalMemory(): number {
  let total = 0
  sampleStore.forEach(entry => {
    total += entry.buffer.duration
  })
  return total
}

// Set SSM2044 filter frequency
function setFilterFrequency(freq: number) {
  if (ssmFilter && audioCtx) {
    ssmFilter.frequency.setTargetAtTime(
      Math.max(20, Math.min(20000, freq)),
      audioCtx.currentTime,
      0.01
    )
  }
}

// Set master volume
function setMasterVolume(vol: number) {
  if (masterGain && audioCtx) {
    masterGain.gain.setTargetAtTime(
      Math.max(0, Math.min(1, vol)),
      audioCtx.currentTime,
      0.01
    )
  }
}

// Suspend/resume context
function suspend() { return audioCtx?.suspend() }
function getContext() { return audioCtx }

export function useAudioEngine() {
  return {
    init,
    resume,
    loadSampleToPad,
    unloadSample,
    setPadPitch,
    setPadGain,
    triggerPad,
    stopVoice,
    stopAll,
    decodeAudioFile,
    decodeAudioBuffer,
    currentTime,
    getSampleDuration,
    hasSample,
    getTotalMemory,
    setFilterFrequency,
    setMasterVolume,
    suspend,
    getContext,
  }
}
