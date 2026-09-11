# Spec: Audio Engine — Full SP-1200 DSP Pipeline

## POV
The sound IS the SP-1200. 12-bit linear sampling at 26.041kHz, zero-order-hold pitch shift, SSM2044 analog output filtration. This is non-negotiable — it's the entire identity of the machine.

---

## 1. Architecture — The Golden Rule
- **Vue/Pinia = UI state only.** Never holds AudioBuffers, never handles the audio clock.
- **Vanilla TS audio engine = everything audio.** AudioContext, AudioBuffers, AudioWorkletNode, Tone.js clock.
- **UI → Engine:** Component calls `audioEngine.triggerPad(padId)` or `audioEngine.setPadPitch(padId, value)`. No audio data flows into reactive state.

## 2. DSP Signal Path (per voice)
```
[Sample AudioBuffer] → [12-bit Quantize] → [26.04kHz Drop-Sample] → [Zero-Order-Hold Pitch Shift] → [SSM2044 Filter] → Output
```

### 2a. 12-Bit Quantization
- Clamp float (-1.0–1.0) to 12-bit integer range (-2048 to 2047), scale back to float.
- Implemented inside AudioWorkletProcessor for per-sample precision.

### 2b. 26.04kHz Drop-Sampling
- Downsample to 26.041kHz (the hardware's native rate).
- Zero-order-hold: repeat current sample index until the digital clock steps to the next. NO interpolation — the intentional lack of interpolation IS the harsh aliasing ring that defines the sound.

### 2c. Zero-Order-Hold Pitch Shift
- Tuning down = repeat samples (drop-sample). Tuning up = skip samples.
- This is the "secret to the ring" — the metallic aliasing artifact producers drove the hardware hot to get.

### 2d. SSM2044 Filter Emulation
- 4-pole analog low-pass filter (the hardware's SSI 2044 chip).
- Steep high-end rolloff starting 6–7kHz, subtle low-mid boost for punch.
- Channels 1–6: dynamic filter. Channels 7–8: unfiltered (full ring distortion).
- BiquadFilterNode can approximate for MVP; full modeling is the target.

## 3. AudioWorklet — The Processor
- File: `sp1200-processor.js` (registered as `'sp1200-processor'`).
- Runs on a separate thread — sub-millisecond precision, no UI jank.
- `parameterDescriptors`: pitch (0.2–2.0), with `setValueAtTime` for zipper-free updates.
- Processes the full per-sample chain: drop-sample clock → 12-bit quantize → output.

## 4. Tone.js — The Clock Only
- Tone.js does NOT do DSP. It provides the rock-solid look-ahead scheduler.
- Web Audio API's internal clock (not JS timers) — solves the timing bottleneck.
- Look-ahead scheduling: queue events slightly ahead of time so UI drops never cause audio drift.

## 5. Voice Architecture — 8 Monophonic Channels
- 8 physical output channels (voices), mapped from 16 pads (pad 1 and 9 share voice 0, etc.).
- **Voice stealing:** triggering a pad while its voice is playing INSTANTLY cuts the old sound. Monophonic per channel.
- This is the hardware's actual behavior — not a limitation, a feature.

## 6. What This Replaces
The existing scaffold synthesizes drum sounds (oscillators → filter → drive → output). This is REPLACED by the sampler + DSP pipeline above. The Rust/WASM engine (`/data/drum-machine/rust-audio-engine`) has useful primitives (Dac12Bit, Ssm2044Filter, AnalogDrive, AnalogEnvelope) that can be adapted, but the architecture changes from synthesis to sample-playback-through-DSP.
