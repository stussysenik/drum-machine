// SP-1200 AudioWorklet Processor
// DSP: 26.04kHz drop-sample → 12-bit quantize → zero-order-hold pitch shift
// Per-sample precision on a separate thread.

const SP1200_SAMPLE_RATE = 26041.0
const QUANTIZE_LEVELS = 4096.0  // 2^12

class Sp1200Voice {
  constructor() {
    this.active = false
    this.sampleData = null   // Float32Array
    this.sourceSampleRate = 48000
    this.position = 0.0
    this.increment = 1.0
    this.gain = 1.0
  }

  trigger(sampleData, sourceSampleRate, pitch, gain) {
    this.sampleData = sampleData
    this.sourceSampleRate = sourceSampleRate
    this.position = 0.0
    // Pitch shift: increment > 1 plays faster (higher pitch), < 1 plays slower
    // Combined with source→target rate conversion for proper SP-1200 timing
    this.increment = pitch * (sourceSampleRate / SP1200_SAMPLE_RATE)
    this.gain = gain
    this.active = true
  }

  stop() {
    this.active = false
    this.sampleData = null
  }

  processSample() {
    if (!this.active || !this.sampleData) return 0.0

    const idx = Math.floor(this.position)
    if (idx >= this.sampleData.length) {
      this.active = false
      return 0.0
    }

    // Zero-order-hold: read current sample, no interpolation
    let sample = this.sampleData[idx]

    // 12-bit quantization (TPDF dither omitted for perf — pure truncation is the sound)
    sample = Math.round(sample * QUANTIZE_LEVELS) / QUANTIZE_LEVELS

    // Advance by increment (drop-sample / pitch shift in one step)
    this.position += this.increment

    return sample * this.gain
  }
}

class Sp1200Processor extends AudioWorkletProcessor {
  constructor() {
    super()
    // 8 monophonic voice channels (pads 1-8 share voices 0-7 with pads 9-16)
    this.voices = Array.from({ length: 8 }, () => new Sp1200Voice())
    this.port.onmessage = (e) => this.handleMessage(e.data)
  }

  handleMessage(msg) {
    switch (msg.type) {
      case 'loadSample': {
        // Pre-load sample data into a voice slot for instant triggering
        // msg: { voiceChannel, sampleData: Float32Array, sampleRate }
        const voice = this.voices[msg.voiceChannel]
        if (voice) {
          voice.sampleData = msg.sampleData
          voice.sourceSampleRate = msg.sampleRate
        }
        break
      }
      case 'trigger': {
        const voice = this.voices[msg.voiceChannel]
        if (voice) {
          // Voice stealing: instant cut (monophonic per channel)
          voice.trigger(
            msg.sampleData,
            msg.sampleRate,
            msg.pitch || 1.0,
            msg.gain || 1.0
          )
        }
        break
      }
      case 'stop': {
        const voice = this.voices[msg.voiceChannel]
        if (voice) voice.stop()
        break
      }
      case 'stopAll': {
        this.voices.forEach(v => v.stop())
        break
      }
    }
  }

  process(inputs, outputs) {
    const output = outputs[0]
    const channel = output[0]
    if (!channel) return true

    for (let i = 0; i < channel.length; i++) {
      let mix = 0.0
      for (let v = 0; v < 8; v++) {
        mix += this.voices[v].processSample()
      }
      // Soft clip to prevent runaway
      channel[i] = mix > 1.0 ? 1.0 : mix < -1.0 ? -1.0 : mix
    }

    return true
  }
}

registerProcessor('sp1200-processor', Sp1200Processor)
