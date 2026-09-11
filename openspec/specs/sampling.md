# Spec: Sampling — Load, Record, Memory

## POV
The SP-1200 is a sampler. Sampling your own sounds IS the instrument. Stock kit for immediate play, plus upload and mic recording to make it yours. The 10-second memory cap is a creative feature.

---

## 1. Sample Sources — Full Sampling
- **Stock kit:** Curated drum sounds, decoded to AudioBuffers on launch, cached in IndexedDB. Play immediately, works offline.
- **User upload:** File picker + drag-and-drop to load your own samples.
- **Mic recording:** Live recording directly into pads (Koala Sampler workflow). Record a sound → it's on a pad instantly.

## 2. Memory Constraint — 10-Second Cap (Hardware-Faithful)
- Total sample memory: 10.0 seconds (the hardware's exact limit).
- No single sample longer than 2.5 seconds.
- **Memory bar** on the LCD: `MEM:[████░░░░░░]` — stark, retro, horizontal.
- When approaching 10.0s: warning or freeze further imports.
- Forces the authentic workflow: pitch things up, slice meticulously.

## 3. Voice Assignment — 8 Channels from 16 Pads
- 16 pads mapped to 8 monophonic voice channels (pad 1 & 9 share voice 0, etc.).
- Pads 1–4: independent outputs. Pads 5–8: exclusive choke groups.
- **Multi-Pitch mode:** one sample mapped across all 8 sliders at fixed pitch intervals (-7, -5, -3, -1, 0, +2, +4, +7 semitones).

## 4. Asset Loading & Caching
- Decode stock kit to AudioBuffers on launch.
- Cache in IndexedDB (via localForage or similar) — instant load on repeat visits, works offline.
- If a user hits a pad before the sample loads: the app must not feel broken (loading state per pad).

## 5. What This Replaces
The existing scaffold synthesizes drum voices (oscillators). This is fully REPLACED by sample playback. The `trigger(voiceId, voice)` switch statement (kick/snare/tom synthesis) becomes `triggerPad(padId)` → look up the pad's assigned AudioBuffer → route through the DSP pipeline.
