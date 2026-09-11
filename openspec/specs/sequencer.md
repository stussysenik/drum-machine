# Spec: Sequencer — Pattern/Song Architecture

## POV
The SP-1200's sequencer has specific structural constraints. 100 patterns, 100 songs, pattern chaining. These constraints ARE the creative workflow — you build a beat by assembling patterns into a song, exactly like the hardware.

---

## 1. Architecture — Faithful SP-1200
- **100 patterns** (up to 999 measures each)
- **100 songs** (pattern chains)
- **Pattern chaining** to build longer sequences
- 16 steps per pattern (one bar), single row of step buttons

## 2. Step Grid — Single Row of 16
- One horizontal row, 16 buttons, playhead sweeps left→right.
- Per-step data: active, velocity (encoded as brightness), accent, tie/slide.
- Red LED playhead (bright), active steps (dim red), empty (off).

## 3. Timing — Tone.js Look-Ahead Clock
- Web Audio API internal clock, NOT JS timers (setInterval/setTimeout drift).
- Tone.js look-ahead scheduler: queue events ahead of time.
- Swing: applied to even steps (SP-1200 behavior, 50–66 range).

## 4. Song Mode
- Patterns chained into songs (the hardware's actual arrangement workflow).
- Pattern select + song select UI on the LCD (`TRK:01`, `SONG:03`).
- The constraints force creativity — you think in patterns and songs.

## 5. What This Replaces
The existing scaffold has per-voice step rows (12 voices × 16 steps, each voice its own row). This is REPLACED by the single-row-of-16 pattern architecture above. The sequencer state moves from `Record<VoiceId, Step[]>` to a pattern/song model.
