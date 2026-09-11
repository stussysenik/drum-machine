# SP-1200 Web Recreation — Agent Guide

## What This Is
A faithful, 1:1 web recreation of the E-mu SP-1200 hardware sampler/sequencer. Not "inspired by" — a re-creation you can spend hours making and saving beats on. The physical constraints (10-second memory, 8 voices, 12-bit/26kHz, banked pads, single data slider) are creative features, not limitations to work around.

## Audience
Working producers who know the hardware — people who will spot a wrong pixel, a wrong shade of charcoal, a label in the wrong place. Quality bar: Lord Finesse leans in and believes it.

## Core Architecture Golden Rule
**Never let Vue's reactivity touch the audio clock or audio arrays.** Pinia holds UI state (which pad is selected, visual grid triggers, parameter values). A vanilla TS audio engine holds the AudioContext, AudioBuffers, AudioWorklet, and the audio clock. When the UI needs audio, it calls the engine. Tone.js provides the look-ahead clock; the AudioWorklet provides the DSP.

## Spec Layout
- `specs/faceplate.md` — Visual design system (the entire look & feel)
- `specs/audio-engine.md` — DSP pipeline, AudioWorklet, Tone.js clock
- `specs/sequencer.md` — Pattern/song architecture, step sequencing
- `specs/sampling.md` — Sample loading, mic recording, memory management
- `specs/persistence.md` — IndexedDB, export/import
- `changes/` — Proposals for each build phase

## How to Work
1. Read `specs/` in full before touching code — the decisions are load-bearing.
2. The existing scaffold (`/data/drum-machine`) is infrastructure, not design. Nuxt 3 + Pinia + UnoCSS + Rust/WASM engine are kept. The 3-panel DAW layout, synthesized voices, and per-voice step rows are REPLACED by the faceplate spec.
3. Every visual decision in the spec is a hardware reference — don't abstract it away.
4. Run typecheck + lint before any commit. No console.log in production.
