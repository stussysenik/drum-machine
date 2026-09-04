// SP-1200 Audio Engine
// Emulates: 12-bit DAC, 26.04kHz sample rate, SSM2044 filters, analog drive
// Physical constraints modeled from actual hardware

import type { DrumVoice, VoiceId, HardwareConstraints } from '~/types'

export function useAudioEngine() {
  let audioCtx: AudioContext | null = null
  let masterGain: GainNode | null = null
  
  // SP-1200 Hardware Constraints
  const hardware: HardwareConstraints = {
    bitDepth: 12,
    sampleRate: 26040,
    maxSampleTime: 10,
    maxVoices: 12,
    filterType: 'ssm2044'
  }

  // Initialize audio context with SP-1200 constraints
  function init() {
    if (audioCtx) return
    
    audioCtx = new AudioContext({
      sampleRate: hardware.sampleRate,  // 26.04kHz - SP-1200 native rate
      latencyHint: 'interactive'
    })
    
    masterGain = audioCtx.createGain()
    masterGain.gain.value = 0.8
    masterGain.connect(audioCtx.destination)
  }

  // 12-bit DAC emulation - quantize to 4096 levels
  function quantize12bit(sample: number): number {
    const levels = Math.pow(2, 12) // 4096 levels
    return Math.round(sample * levels) / levels
  }

  // SSM2044 filter emulation - 4-pole lowpass with resonance
  function createSSM2044Filter(cutoff: number, resonance: number): BiquadFilterNode {
    if (!audioCtx) init()
    
    const filter = audioCtx!.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = cutoff * 20000 // Map 0-100 to 0-20kHz
    filter.Q.value = 1 + (resonance / 100) * 14 // Q: 1-15 (SSM2044 range)
    return filter
  }

  // Analog drive emulation - soft clipping curve
  function createDrive(amount: number): WaveShaperNode {
    if (!audioCtx) init()
    
    const shaper = audioCtx!.createWaveShaper()
    const drive = amount / 100
    const samples = 44100
    const curve = new Float32Array(samples)
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1
      // Soft clipping curve modeled after analog saturation
      curve[i] = ((1 + drive * 10) * x) / (1 + drive * 10 * Math.abs(x))
    }
    
    shaper.curve = curve
    return shaper
  }

  // Kick drum synthesis - tuned sine with pitch sweep
  function createKick(voice: DrumVoice): void {
    if (!audioCtx || !masterGain) return
    
    const now = audioCtx.currentTime
    const tune = voice.params.tune.value / 100
    const decay = voice.params.decay.value / 100
    const drive = voice.params.drive.value / 100
    const level = voice.params.level.value / 100
    const filter = voice.params.filter.value / 100
    const resonance = voice.params.resonance.value / 100

    // Oscillator - tuned sine wave (SP-1200: 30-80Hz range)
    const osc = audioCtx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150 * (0.5 + tune), now)
    osc.frequency.exponentialRampToValueAtTime(30 + tune * 30, now + 0.1 * decay)

    // Amplitude envelope - SP-1200 attack characteristic
    const amp = audioCtx.createGain()
    amp.gain.setValueAtTime(0, now)
    amp.gain.linearRampToValueAtTime(level, now + 0.002) // Fast attack
    amp.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + decay * 0.5)

    // SSM2044 filter
    const filterNode = createSSM2044Filter(filter, resonance)
    
    // Drive circuit
    const driveNode = createDrive(drive)

    // Signal chain: osc -> filter -> drive -> amp -> output
    osc.connect(filterNode)
    filterNode.connect(driveNode)
    driveNode.connect(amp)
    amp.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.6)
  }

  // Snare drum synthesis - noise + tone
  function createSnare(voice: DrumVoice): void {
    if (!audioCtx || !masterGain) return
    
    const now = audioCtx.currentTime
    const tune = voice.params.tune.value / 100
    const decay = voice.params.decay.value / 100
    const snappy = voice.params.snappy.value / 100
    const drive = voice.params.drive.value / 100
    const level = voice.params.level.value / 100
    const filter = voice.params.filter.value / 100
    const resonance = voice.params.resonance.value / 100

    // Tone component
    const osc = audioCtx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(200 + tune * 100, now)
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05)

    const toneAmp = audioCtx.createGain()
    toneAmp.gain.setValueAtTime(level * 0.6, now)
    toneAmp.gain.exponentialRampToValueAtTime(0.001, now + 0.05 + decay * 0.15)

    // Noise component (snare)
    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1
    }
    
    const noise = audioCtx.createBufferSource()
    noise.buffer = noiseBuffer

    const noiseAmp = audioCtx.createGain()
    noiseAmp.gain.setValueAtTime(level * snappy, now)
    noiseAmp.gain.exponentialRampToValueAtTime(0.001, now + 0.05 + snappy * 0.2)

    // Filter
    const filterNode = createSSM2044Filter(filter * 0.8 + 0.2, resonance)
    const driveNode = createDrive(drive)

    // Mix tone + noise
    const mixer = audioCtx.createGain()
    osc.connect(toneAmp)
    toneAmp.connect(mixer)
    noise.connect(noiseAmp)
    noiseAmp.connect(filterNode)
    filterNode.connect(mixer)

    mixer.connect(driveNode)
    driveNode.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.2)
    noise.start(now)
    noise.stop(now + 0.2)
  }

  // Hi-hat synthesis - filtered noise
  function createHihat(voice: DrumVoice, open: boolean = false): void {
    if (!audioCtx || !masterGain) return
    
    const now = audioCtx.currentTime
    const decay = voice.params.decay.value / 100
    const drive = voice.params.drive.value / 100
    const level = voice.params.level.value / 100
    const filter = voice.params.filter.value / 100
    const resonance = voice.params.resonance.value / 100

    const duration = open ? 0.3 + decay * 0.3 : 0.05 + decay * 0.1

    // Noise source
    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1
    }
    
    const noise = audioCtx.createBufferSource()
    noise.buffer = noiseBuffer

    // Highpass for metallic character
    const hpf = audioCtx.createBiquadFilter()
    hpf.type = 'highpass'
    hpf.frequency.value = 7000 + filter * 8000

    // SSM2044 filter
    const filterNode = createSSM2044Filter(filter * 0.5 + 0.5, resonance)
    
    // Drive
    const driveNode = createDrive(drive)

    // Envelope
    const amp = audioCtx.createGain()
    amp.gain.setValueAtTime(level, now)
    amp.gain.exponentialRampToValueAtTime(0.001, now + duration)

    // Signal chain
    noise.connect(hpf)
    hpf.connect(filterNode)
    filterNode.connect(driveNode)
    driveNode.connect(amp)
    amp.connect(masterGain)

    noise.start(now)
    noise.stop(now + duration)
  }

  // Tom/Conga synthesis - pitched noise + tone
  function createTom(voice: DrumVoice, pitch: number = 1): void {
    if (!audioCtx || !masterGain) return
    
    const now = audioCtx.currentTime
    const tune = voice.params.tune.value / 100
    const decay = voice.params.decay.value / 100
    const drive = voice.params.drive.value / 100
    const level = voice.params.level.value / 100
    const filter = voice.params.filter.value / 100
    const resonance = voice.params.resonance.value / 100

    const baseFreq = 80 + pitch * 60 + tune * 100

    const osc = audioCtx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(baseFreq * 1.5, now)
    osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.05)

    const amp = audioCtx.createGain()
    amp.gain.setValueAtTime(level, now)
    amp.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + decay * 0.4)

    const filterNode = createSSM2044Filter(filter, resonance)
    const driveNode = createDrive(drive)

    osc.connect(filterNode)
    filterNode.connect(driveNode)
    driveNode.connect(amp)
    amp.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.5)
  }

  // Clap synthesis - layered noise bursts
  function createClap(voice: DrumVoice): void {
    if (!audioCtx || !masterGain) return
    
    const now = audioCtx.currentTime
    const decay = voice.params.decay.value / 100
    const drive = voice.params.drive.value / 100
    const level = voice.params.level.value / 100
    const filter = voice.params.filter.value / 100
    const resonance = voice.params.resonance.value / 100

    const filterNode = createSSM2044Filter(filter * 0.6 + 0.3, resonance)
    const driveNode = createDrive(drive)

    // Multiple short noise bursts
    for (let i = 0; i < 3; i++) {
      const offset = i * 0.01
      const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.02, audioCtx.sampleRate)
      const noiseData = noiseBuffer.getChannelData(0)
      for (let j = 0; j < noiseData.length; j++) {
        noiseData[j] = Math.random() * 2 - 1
      }
      
      const noise = audioCtx.createBufferSource()
      noise.buffer = noiseBuffer

      const amp = audioCtx.createGain()
      amp.gain.setValueAtTime(level * (i === 2 ? 1 : 0.6), now + offset)
      amp.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.02 + decay * 0.1)

      noise.connect(filterNode)
      filterNode.connect(driveNode)
      driveNode.connect(amp)
      amp.connect(masterGain)

      noise.start(now + offset)
      noise.stop(now + offset + 0.05)
    }
  }

  // Cowbell synthesis - dual oscillators
  function createCowbell(voice: DrumVoice): void {
    if (!audioCtx || !masterGain) return
    
    const now = audioCtx.currentTime
    const decay = voice.params.decay.value / 100
    const drive = voice.params.drive.value / 100
    const level = voice.params.level.value / 100
    const filter = voice.params.filter.value / 100
    const resonance = voice.params.resonance.value / 100

    const filterNode = createSSM2044Filter(filter * 0.4 + 0.5, resonance)
    const driveNode = createDrive(drive)
    const amp = audioCtx.createGain()
    amp.gain.setValueAtTime(level, now)
    amp.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + decay * 0.3)

    // Two detuned square waves
    const osc1 = audioCtx.createOscillator()
    osc1.type = 'square'
    osc1.frequency.value = 800

    const osc2 = audioCtx.createOscillator()
    osc2.type = 'square'
    osc2.frequency.value = 540

    osc1.connect(filterNode)
    osc2.connect(filterNode)
    filterNode.connect(driveNode)
    driveNode.connect(amp)
    amp.connect(masterGain)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.4)
    osc2.stop(now + 0.4)
  }

  // Cymbal synthesis - complex noise with modulation
  function createCymbal(voice: DrumVoice): void {
    if (!audioCtx || !masterGain) return
    
    const now = audioCtx.currentTime
    const decay = voice.params.decay.value / 100
    const drive = voice.params.drive.value / 100
    const level = voice.params.level.value / 100
    const filter = voice.params.filter.value / 100
    const resonance = voice.params.resonance.value / 100

    const duration = 0.3 + decay * 0.7

    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1
    }
    
    const noise = audioCtx.createBufferSource()
    noise.buffer = noiseBuffer

    // Bandpass for metallic character
    const bpf = audioCtx.createBiquadFilter()
    bpf.type = 'bandpass'
    bpf.frequency.value = 4000 + filter * 6000
    bpf.Q.value = 0.5 + resonance * 0.5

    const driveNode = createDrive(drive)
    const amp = audioCtx.createGain()
    amp.gain.setValueAtTime(level, now)
    amp.gain.exponentialRampToValueAtTime(0.001, now + duration)

    noise.connect(bpf)
    bpf.connect(driveNode)
    driveNode.connect(amp)
    amp.connect(masterGain)

    noise.start(now)
    noise.stop(now + duration)
  }

  // Rimshot synthesis - short noise burst
  function createRimshot(voice: DrumVoice): void {
    if (!audioCtx || !masterGain) return
    
    const now = audioCtx.currentTime
    const drive = voice.params.drive.value / 100
    const level = voice.params.level.value / 100
    const filter = voice.params.filter.value / 100
    const resonance = voice.params.resonance.value / 100

    const osc = audioCtx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.02)

    const amp = audioCtx.createGain()
    amp.gain.setValueAtTime(level, now)
    amp.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    const filterNode = createSSM2044Filter(filter * 0.7 + 0.3, resonance)
    const driveNode = createDrive(drive)

    osc.connect(filterNode)
    filterNode.connect(driveNode)
    driveNode.connect(amp)
    amp.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.1)
  }

  // Click synthesis - short high-pitched click
  function createClick(voice: DrumVoice): void {
    if (!audioCtx || !masterGain) return
    
    const now = audioCtx.currentTime
    const level = voice.params.level.value / 100
    const filter = voice.params.filter.value / 100

    const osc = audioCtx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = 2000 + filter * 3000

    const amp = audioCtx.createGain()
    amp.gain.setValueAtTime(level * 0.5, now)
    amp.gain.exponentialRampToValueAtTime(0.001, now + 0.01)

    osc.connect(amp)
    amp.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.02)
  }

  // Main trigger function
  function trigger(voiceId: VoiceId, voice: DrumVoice): void {
    if (!audioCtx) init()
    if (audioCtx?.state === 'suspended') audioCtx.resume()

    switch (voiceId) {
      case 'bd': createKick(voice); break
      case 'sd': createSnare(voice); break
      case 'lt': createTom(voice, 0.5); break
      case 'mt': createTom(voice, 1); break
      case 'ht': createTom(voice, 1.5); break
      case 'rs': createRimshot(voice); break
      case 'cp': createClap(voice); break
      case 'cb': createCowbell(voice); break
      case 'cy': createCymbal(voice); break
      case 'oh': createHihat(voice, true); break
      case 'ch': createHihat(voice, false); break
      case 'cl': createClick(voice); break
    }
  }

  // Suspend/resume
  function suspend() {
    audioCtx?.suspend()
  }

  function resume() {
    audioCtx?.resume()
  }

  return {
    hardware,
    init,
    trigger,
    suspend,
    resume
  }
}
