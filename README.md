# SP-1200 | Hardware Sampler

> A faithful web recreation of the E-mu SP-1200 — 12-bit, 26.04kHz, 8-voice sampler/sequencer.

Built with Nuxt 3, Tone.js, and a Rust/WASM audio engine.

## Live Demo

**[stussysenik-sp1200.vercel.app](https://stussysenik-sp1200.vercel.app)**

## What It Is

A 1:1 hardware model of the E-mu SP-1200 — the legendary 12-bit sampler that defined hip-hop, boom-bap, and lo-fi production. Every knob, slider, pad, and LCD pixel is reproduced in the browser.

## Hardware Specs (Recreated)

- **12-bit / 26.04kHz** sampling fidelity
- **8 voice channels** with discrete faders
- **32 sound pads** across 4 banks (A–D)
- **100 patterns** (segments) and **100 songs**
- **2×16 character LCD** with green-amber fluorescent rendering
- **Step sequencer** with 16 steps, velocity, accents, and ties
- **Swing** at 50/54/58/62/67/71
- **Tempo range:** 40.0–125.0 BPM
- **10.2 seconds** total sample memory (authentic SP-1200 constraint)

## Performance Modes

| Mode | Description |
|------|-------------|
| **TUNE/DECAY** | Sliders control pitch and decay per channel |
| **MIX** | Sliders control channel levels (classic mixing desk) |
| **MULTI** | Pads trigger pitch spread / level spread |

## Hardware Modules

- **SYNC** — Internal, MIDI, SMPTE
- **SAMPLE** — VU meter, threshold, record arm
- **DISK** — Load, save, catalog
- **SET-UP** — Functions 11–23
- **PERFORMANCE** — Full live control

## Step Sequencer

- 16-step grid with per-step velocity
- Accent and tie per step
- Real-time and step recording
- Pattern chain into full songs

## Song Workbench

Chain patterns into songs with repeat counts. Queue song switches at segment boundaries for live performance.

## Learn Companion

Built-in tutorials and study patterns that guide you through classic SP-1200 techniques.

## Audio Engine

- **Tone.js** for scheduling and transport
- **Rust/WASM** core for real-time audio processing
- **localforage** for session persistence

## Project Structure

```
components/faceplate/   — Hardware UI modules (LCD, pads, faders, etc.)
composables/            — Audio engine, sequencer, keyboard, persistence
stores/drumMachine.ts   — Pinia store (1:1 hardware state model)
types/                  — TypeScript interfaces for all hardware concepts
data/lessons.ts         — Learn companion curriculum
rust-audio-engine/      — Rust → WASM audio processing
```

## Development

```bash
pnpm install
pnpm dev      # Local dev server
pnpm build    # Static export (ssr: false)
```

## Tech Stack

- [Nuxt 3](https://nuxt.com/) — Framework
- [Vue 3](https://vuejs.org/) — UI
- [Pinia](https://pinia.vuejs.org/) — State
- [Tone.js](https://tonejs.github.io/) — Audio scheduling
- [UnoCSS](https://unocss.dev/) — Utility CSS with SP-1200 theme tokens
- [Rust/WASM](https://rustwasm.github.io/) — Real-time audio core
- [localforage](https://localforage.github.io/localForage/) — Session persistence

## Credits

Based on the E-mu Systems SP-1200 (1987). This is an unofficial fan recreation for educational purposes.

---

Made by [senik](https://github.com/stussysenik)
