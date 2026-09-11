// SP-1200 Stock Kit — Programmatically generated drum samples
// 12-bit, 26.041kHz native rate. Sounds like the hardware.
//
// SINGLETON: prevents double-loading when multiple components call this.

import type { SampleData, PadId } from '~/types'
import { SP1200 } from '~/types'

const KIT_SAMPLE_RATE = SP1200.SAMPLE_RATE  // 26041

let _audio: ReturnType<typeof useAudioEngine> | null = null
let loaded = false

function getAudio() {
  if (!_audio) _audio = useAudioEngine()
  return _audio
}

export function useStockKit() {

  // Generate a sine-based kick drum
  function generateKick(): Float32Array {
    const duration = 0.3
    const len = Math.floor(KIT_SAMPLE_RATE * duration)
    const data = new Float32Array(len)

    for (let i = 0; i < len; i++) {
      const t = i / KIT_SAMPLE_RATE
      // Pitch sweep: 150Hz → 40Hz
      const phase = 2 * Math.PI * (150 * t - 105 * t * t)
      // Amplitude envelope: fast attack, exponential decay
      const env = Math.exp(-t * 12)
      data[i] = Math.sin(phase) * env * 0.9
    }
    return quantize12Bit(data)
  }

  // Generate snare (tone + noise)
  function generateSnare(): Float32Array {
    const duration = 0.2
    const len = Math.floor(KIT_SAMPLE_RATE * duration)
    const data = new Float32Array(len)

    for (let i = 0; i < len; i++) {
      const t = i / KIT_SAMPLE_RATE
      // Tone component (triangle, ~200Hz)
      const tonePhase = (200 * t) % 1
      const tone = Math.abs(tonePhase * 4 - 2) - 1
      // Noise component
      const noise = Math.random() * 2 - 1
      // Mix with envelope
      const env = Math.exp(-t * 20)
      data[i] = (tone * 0.5 + noise * 0.5) * env * 0.8
    }
    return quantize12Bit(data)
  }

  // Generate tom (pitched, lower)
  function generateTom(pitch: number = 1): Float32Array {
    const duration = 0.25
    const len = Math.floor(KIT_SAMPLE_RATE * duration)
    const data = new Float32Array(len)
    const baseFreq = 80 + pitch * 60

    for (let i = 0; i < len; i++) {
      const t = i / KIT_SAMPLE_RATE
      const phase = 2 * Math.PI * (baseFreq * t - baseFreq * 0.3 * t * t)
      const env = Math.exp(-t * 10)
      data[i] = Math.sin(phase) * env * 0.85
    }
    return quantize12Bit(data)
  }

  // Generate hi-hat (filtered noise)
  function generateHihat(open: boolean = false): Float32Array {
    const duration = open ? 0.3 : 0.06
    const len = Math.floor(KIT_SAMPLE_RATE * duration)
    const data = new Float32Array(len)
    let hpState = 0

    for (let i = 0; i < len; i++) {
      const t = i / KIT_SAMPLE_RATE
      const noise = Math.random() * 2 - 1
      // Simple highpass (metallic character)
      hpState = hpState * 0.95 + noise * 0.05
      const hp = noise - hpState * 3
      const env = Math.exp(-t * (open ? 8 : 40))
      data[i] = hp * env * 0.6
    }
    return quantize12Bit(data)
  }

  // Generate clap (multiple noise bursts)
  function generateClap(): Float32Array {
    const duration = 0.15
    const len = Math.floor(KIT_SAMPLE_RATE * duration)
    const data = new Float32Array(len)

    for (let i = 0; i < len; i++) {
      const t = i / KIT_SAMPLE_RATE
      let env = 0
      // 3 short bursts
      for (let b = 0; b < 3; b++) {
        const burstStart = b * 0.008
        const burstT = t - burstStart
        if (burstT >= 0 && burstT < 0.02) {
          env = Math.max(env, Math.exp(-burstT * 80))
        }
      }
      const noise = Math.random() * 2 - 1
      data[i] = noise * env * 0.7
    }
    return quantize12Bit(data)
  }

  // Generate rimshot (short click + tone)
  function generateRimshot(): Float32Array {
    const duration = 0.06
    const len = Math.floor(KIT_SAMPLE_RATE * duration)
    const data = new Float32Array(len)

    for (let i = 0; i < len; i++) {
      const t = i / KIT_SAMPLE_RATE
      const phase = 2 * Math.PI * 800 * t
      const env = Math.exp(-t * 50)
      data[i] = Math.sin(phase) * env * 0.7
    }
    return quantize12Bit(data)
  }

  // Generate cowbell (dual tone)
  function generateCowbell(): Float32Array {
    const duration = 0.15
    const len = Math.floor(KIT_SAMPLE_RATE * duration)
    const data = new Float32Array(len)

    for (let i = 0; i < len; i++) {
      const t = i / KIT_SAMPLE_RATE
      const s1 = Math.sign(Math.sin(2 * Math.PI * 800 * t))
      const s2 = Math.sign(Math.sin(2 * Math.PI * 540 * t))
      const env = Math.exp(-t * 15)
      data[i] = (s1 + s2) * 0.4 * env
    }
    return quantize12Bit(data)
  }

  // Quantize to 12-bit
  function quantize12Bit(data: Float32Array): Float32Array {
    const levels = 4096  // 2^12
    const result = new Float32Array(data.length)
    for (let i = 0; i < data.length; i++) {
      result[i] = Math.round(data[i] * levels) / levels
    }
    return result
  }

  // Convert Float32Array → AudioBuffer
  function toAudioBuffer(data: Float32Array, sampleRate: number): AudioBuffer {
    const offline = new OfflineAudioContext(1, data.length, sampleRate)
    const buffer = offline.createBuffer(1, data.length, sampleRate)
    buffer.getChannelData(0).set(data)
    return buffer
  }

  // Load the full stock kit (idempotent — only loads once)
  async function loadStockKit() {
    if (loaded) return
    loaded = true

    const store = useDrumMachineStore()
    const audio = getAudio()

    const kitSamples: { name: string; padId: PadId; generator: () => Float32Array }[] = [
      { name: 'BASS DRUM', padId: 0, generator: generateKick },
      { name: 'SNARE', padId: 1, generator: generateSnare },
      { name: 'LOW TOM', padId: 2, generator: () => generateTom(0.5) },
      { name: 'MID TOM', padId: 3, generator: () => generateTom(1) },
      { name: 'HI TOM', padId: 4, generator: () => generateTom(1.5) },
      { name: 'RIMSHOT', padId: 5, generator: generateRimshot },
      { name: 'CLAP', padId: 6, generator: generateClap },
      { name: 'CLOSED HAT', padId: 7, generator: () => generateHihat(false) },
      { name: 'OPEN HAT', padId: 8, generator: () => generateHihat(true) },
      { name: 'COWBELL', padId: 9, generator: generateCowbell },
      { name: 'CLAVE', padId: 10, generator: generateRimshot },
    ]

    for (const kit of kitSamples) {
      const data = kit.generator()
      const buffer = toAudioBuffer(data, KIT_SAMPLE_RATE)

      audio.loadSampleToPad(kit.padId, buffer)

      const sampleData: SampleData = {
        id: `stock_${kit.padId}`,
        name: kit.name,
        buffer,
        duration: buffer.duration,
        sampleRate: KIT_SAMPLE_RATE,
        isStock: true,
        assignedPad: kit.padId,
      }

      store.addSample(sampleData)
      store.assignSampleToPad(sampleData.id, kit.padId)
    }
  }

  return {
    loadStockKit,
    generateKick,
    generateSnare,
    generateTom,
    generateHihat,
    generateClap,
    generateRimshot,
    generateCowbell,
  }
}
