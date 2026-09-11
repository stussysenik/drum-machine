# E-mu Systems SP-1200: Master Technical Reference Manual & 1:1 Architecture Specification

> **Document Type:** Canonical Source of Truth & Engineering Reference  
> **Target System:** 1:1 Functional Web-Audio / WebAssembly Hardware Replica of the E-mu SP-1200 (1987)  
> **Status:** Active Reference Manual  
> **Source Documents:** E-mu SP-1200 Service Manual (1987), E-mu SP-1200 Owner's Manual (1987 Rev. E), Rossum Electro-Music Architecture Notes, Olli Niemitalo DSP Analysis.

---

## 1. Executive Summary & Vision Statement

The E-mu Systems SP-1200 (Sampling Percussion System) released in 1987 is the foundational instrument of golden-era hip-hop and electronic music production. Its sonic signature is not the result of a generic bitcrusher plugin, but rather the deterministic physical interaction of:
1. A **12-bit linear PCM converter** operating at a fixed crystal clock of **26.041666 kHz**.
2. A **drop-sample / clock-skipping phase accumulator** (Zero-Order Hold) transposition algorithm without interpolation.
3. An analog output demultiplexer driving **discrete analog output stages**:
   - **Channels 1 & 2:** Dynamic 4-pole low-pass filters with analog envelope decay (SSM2044 / SSI2144).
   - **Channels 3 to 6:** Static reconstruction low-pass filters of differing cutoff steepness.
   - **Channels 7 & 8:** Direct, unfiltered DAC outputs with raw aliasing image bands.
4. A **front-panel workflow** composed of 7 distinct functional modules, 8 channel faders, 8 tactile drum play pads, 4 banks (A, B, C, D = 32 sounds), a 2×16 backlit LCD, and a numeric data-entry keypad.

This document serves as the permanent, authoritative technical manual for the 1:1 software replica. Any engineer, researcher, or developer working on this project must treat this specification as the immutable ground truth.

---

## 2. System Architecture Overview

```
                                  [ AUDIO INPUT (Sampling) ]
                                               │
                                               ▼
                              ┌───────────────────────────────────┐
                              │ Anti-Aliasing Input Filter        │
                              │ - Steep 7-pole / 42 dB/oct LPF    │
                              │ - Cutoff: ~10.5 kHz               │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │ 12-Bit Linear ADC (SAR + DAC)     │
                              │ - Sample Rate: 26.041666 kHz      │
                              │ - Word Length: 12-bit signed int  │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │ 256K Sample RAM (4 × 2.5s Banks)  │
                              │ - Banks A, B, C, D (10.04s Total) │
                              │ - 4464 DRAM Bank Addressing       │
                              └─────────────────┬─────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 │                                                             │
                 ▼                                                             ▼
┌─────────────────────────────────┐                           ┌───────────────────────────────────┐
│ Z80 / Microcontroller Subsystem │                           │ Digital Playback Core             │
│ - Pattern & Song Sequencer      │                           │ - 8 Monophonic Voice Channels     │
│ - Dynamic Pad & Velocity Logic  │                           │ - Phase Accumulator Transposition │
│ - Front Panel & Keypad Polling  │                           │ - Zero-Order Hold (Clock-Skip)    │
└────────────────┬────────────────┘                           └─────────────────┬─────────────────┘
                 │                                                              │
                 │ Multiplier Attenuation Register (8-bit)                      │
                 └──────────────────────────────┬───────────────────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │ 12-Bit Linear Playback DAC        │
                              │ + 8-Bit Multiplying DAC (Volume)  │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │ Analog Channel De-Multiplexer     │
                              │ - 8 Sample & Hold Output Nodes    │
                              └─────────────────┬─────────────────┘
                                                │
        ┌───────────────┬───────────────────────┼───────────────────────┬───────────────┐
        ▼               ▼                       ▼                       ▼               ▼
┌──────────────┐ ┌──────────────┐        ┌──────────────┐        ┌──────────────┐ ┌──────────────┐
│ Channels 1-2 │ │ Channels 3-4 │        │ Channels 5-6 │        │ Channels 7-8 │ │  Metronome   │
│ Dynamic LPF  │ │ Static LPF   │        │ Static LPF   │        │ Unfiltered   │ │  Click Gen   │
│ SSM2044 24dB │ │ 4-Pole Fixed │        │ 4-Pole Fixed │        │ Direct Out   │ │  Piezo Beeper│
│ w/ Envelope  │ │ fc ~ 4.2 kHz │        │ fc ~ 8.5 kHz │        │ Wide-Band    │ │              │
└───────┬──────┘ └──────┬───────┘        └──────┬───────┘        └──────┬───────┘ └──────┬───────┘
        │               │                       │                       │                │
        └───────────────┴───────────────────────┼───────────────────────┴────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │ Master Mix Summing Amplifier      │
                              │ - Mix Volume Attenuator Pot       │
                              │ - Metronome Volume Attenuator Pot │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                                    [ STEREO / MONO MIX OUT ]
                                    [ 8 INDIVIDUAL JACKS ]
```

---

## 3. Digital Audio Core & DSP Specification

### 3.1. Sampling Rate & Word Length
- **Exact Sample Rate ($F_s$):**
  $$F_s = \frac{10.000000 \text{ MHz}}{384} = 26041.6667 \text{ Hz}$$
- **PCM Format:** 12-bit signed linear integer quantization:
  $$\text{Quantized Range} = [-2048, +2047]$$
- Modern 32-bit floating point browser audio $[-1.0, +1.0]$ is converted to and from 12-bit linear PCM using:
  $$x_{\text{12bit}} = \operatorname{clamp}\left(\lfloor x \cdot 2047.5 \rfloor, -2048, 2047\right)$$
  $$x_{\text{float}} = \frac{x_{\text{12bit}}}{2048.0}$$

### 3.2. Drop-Sample Transposition (The Pitching Grime)
Unlike modern samplers that use linear, cubic Hermite, or band-limited sinc interpolation to change pitch, the SP-1200 uses a **discrete Phase Accumulator with Zero-Order Hold (ZOH)**.

When a sample is pitched down:
1. The hardware playback clock reads memory addresses at a variable rate, effectively repeating samples.
2. When pitched up, it skips samples.
3. No anti-imaging interpolation filter exists prior to the DAC.
4. This creates severe, harmonically rich aliasing sidebands:
   $$f_{\text{alias}} = |k \cdot F_s \pm f_0|$$
   These mirror frequencies interact with the fundamental frequency, producing the famous metallic punch, crunch, and ring-modulated overtones on down-pitched records.

**Mathematical Implementation in AudioWorklet:**
```typescript
class SP1200Voice {
  phase: number = 0;
  playbackRate: number = 1.0; // pitch ratio
  sampleData: Int16Array;    // 12-bit PCM values [-2048, 2047]

  processSample(): number {
    const intIndex = Math.floor(this.phase);
    if (intIndex >= this.sampleData.length) return 0;
    
    // Exact zero-order hold (drop/repeat sample)
    const raw12 = this.sampleData[intIndex];
    this.phase += this.playbackRate;
    
    // Scale to float [-1.0, 1.0]
    return raw12 / 2048.0;
  }
}
```

### 3.3. Memory Budget & Bank Partitioning
- **Total Sound Memory:** $256\text{K words} = 524,288 \text{ nibbles} = 393,216 \text{ bytes}$.
- **Total Sampling Time:** Exactly $10.04 \text{ seconds}$.
- **Bank Allocation:** Divided strictly into **4 non-contiguous banks** of $2.51 \text{ seconds}$ each:
  - Bank A: 2.51 seconds
  - Bank B: 2.51 seconds
  - Bank C: 2.51 seconds
  - Bank D: 2.51 seconds
- **Bank Boundary Rule:** A sample cannot cross bank boundaries. The maximum duration for any single sample is **2.50 seconds**.

---

## 4. Analog Stage & Channel Filter Circuitry

The SP-1200 routes its 8 multiplexed DAC outputs into 8 dedicated physical voice channels with radically different analog filtering:

### 4.1. Channels 1 & 2: Dynamic 4-Pole SSM2044 Low-Pass Filter
- **Filter Topology:** 24 dB/octave (4-pole) active low-pass voltage-controlled filter (SSM2044 IC, or SSI2144 in modern reissues).
- **Dynamic Control:** The cutoff frequency is modulated by an analog exponential envelope triggered at note start.
- **Audible Effect:** High frequencies are present during the initial transient and rapidly close down as the sound decays. Bass drums and snares assigned to Ch 1 & 2 obtain a heavy, punchy bottom end without high-frequency hiss.
- **Differential Equation (Bilinear Transform / Runge-Kutta 4th Order):**
  $$y_n = \tanh\left(x_n - 4 \cdot k_{\text{res}} \cdot y_{n-1}\right)$$
  Each of the 4 cascaded 1-pole sections follows:
  $$\frac{dy_i}{dt} = \omega_c \cdot \left(\tanh(y_{i-1}) - \tanh(y_i)\right)$$

### 4.2. Channels 3 & 4: Static Low-Pass Reconstruction Filter
- **Filter Topology:** Fixed 4-pole analog Sallen-Key low-pass filter.
- **Cutoff Frequency ($f_c$):** $\approx 4.2 \text{ kHz}$ to $4.8 \text{ kHz}$.
- **Audible Effect:** Muffled, warm, dark acoustic character. Ideal for low toms, rimshots, or sub-basses where aliasing images above 5 kHz are completely eliminated.

### 4.3. Channels 5 & 6: Static Medium-High Reconstruction Filter
- **Filter Topology:** Fixed 2-pole / 4-pole analog low-pass filter.
- **Cutoff Frequency ($f_c$):** $\approx 8.5 \text{ kHz}$ to $9.5 \text{ kHz}$.
- **Audible Effect:** Moderate warmth, preserving midrange snare sizzle while reducing 26 kHz clock whine.

### 4.4. Channels 7 & 8: Unfiltered Direct DAC Outs
- **Filter Topology:** Wide open (DC to 20+ kHz flat buffer).
- **Audible Effect:** High-frequency clock mirror frequencies and severe aliasing remain completely audible. Historically assigned to hi-hats, cymbals, and shakers to retain extreme crispness and distinctive digital presence.

---

## 5. Front Panel Topology: The 7 Hardware Modules

The physical front panel of the SP-1200 is divided into 7 functional modules silkscreened in white industrial sans-serif on dark warm charcoal aluminum.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  E-mu Systems, Inc.                             SP-1200 SAMPLING PERCUSSION SYSTEM                              │
├───────────────────────┬───────────────────────┬───────────────────────┬───────────────────────┬─────────────────┤
│ SYNC                  │ SAMPLE                │ DISK                  │ SET-UP                │ MASTER CONTROL  │
│  1. INTERNAL          │  1. VU MODE           │  1. LOAD ALL          │  11. MULTI-PITCH      │ ┌─────────────┐ │
│  2. MIDI              │  2. ASSIGN VOICE      │  2. SAVE ALL          │  12. MULTI-LEVEL      │ │  2x16 LCD   │ │
│  3. SMPTE             │  3. INPUT LEVEL       │  3. CATALOG DISK      │  13. EXIT MULTI-MODE  │ └─────────────┘ │
│  4. CLICK             │  4. THRESHOLD         │  4. FORMAT DISK       │  14. DYNAMIC BUTTONS  │ [7] [8] [9]     │
│                       │  5. SAMPLE LENGTH     │  5. COPY SOFTWARE     │  15. STORE MIX        │ [4] [5] [6]     │
│                       │  6. RE-SAMPLE         │  6. LOAD SOUND        │  16. SELECT MIX       │ [1] [2] [3]     │
│                       │  7. ARM SAMPLE        │  7. SAVE SOUND        │  17. CHANNEL ASSIGN   │ [0] [NO] [YES]  │
│                       │  8. FORCE SAMPLE      │  8. ERASE DISK        │  18. DECAY/TUNE SELECT│ [ENTER] [<] [>] │
│                       │                       │                       │  19. TRUNCATE / LOOP  │ [TEMPO]         │
│                       │                       │                       │  20. DELETE SOUND     │ VOL: MIX / METRO│
│                       │                       │                       │  21. MIDI PARAMETERS  │                 │
│                       │                       │                       │  22. DYNAMIC ALLOC    │                 │
│                       │                       │                       │  23. SPECIAL FUNCTIONS│                 │
├───────────────────────┴───────────────────────┴───────────────────────┴───────────────────────┴─────────────────┤
│ PROGRAMMING MODULE                                                                                              │
│ [SEGMENT / SONG]  (1) TRIGGER    (2) REPEAT   (3) END      (4) INSERT   (5) DELETE   (6) MIX   (7) TEMPO (8) STEP│
│                   (1) AUTO-CORR  (2) TIME-SIG (3) LENGTH   (4) METRO    (5) ERASE    (6) STEP  (7) COPY  (8) SWING│
├───────────────────────────────────────────────────────────────────────────────────────────────┬─────────────────┤
│ PERFORMANCE MODULE                                                                            │ 3.5" DISK DRIVE │
│                                                                                               │                 │
│ [MODE]              [1]     [2]     [3]     [4]     [5]     [6]     [7]     [8]               │ ┌─────────────┐ │
│ (o) TUNE/DECAY      │█│     │█│     │█│     │█│     │█│     │█│     │█│     │█│  CHANNEL      │ │             │ │
│ (o) MIX             │ │     │ │     │ │     │ │     │ │     │ │     │ │     │ │  SLIDERS      │ │  DISK SLOT  │ │
│ (o) MULTI-MODE      │ │     │ │     │ │     │ │     │ │     │ │     │ │     │ │               │ │             │ │
│                     ─┼─     ─┼─     ─┼─     ─┼─     ─┼─     ─┼─     ─┼─     ─┼─  (CENTER)     │ └─────────────┘ │
│ [BANK SELECT]       │ │     │ │     │ │     │ │     │ │     │ │     │ │     │ │               │ [EJECT] (o) BUSY│
│ (o) A (o) B         │ │     │ │     │ │     │ │     │ │     │ │     │ │     │ │               │                 │
│ (o) C (o) D         │ │     │ │     │ │     │ │     │ │     │ │     │ │     │ │               ├─────────────────┤
│                     │█│     │█│     │█│     │█│     │█│     │█│     │█│     │█│               │ POWER / BADGE   │
│ [RUN/STOP] [REC]    ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐             │  E-MU SYSTEMS   │
│ [TAP / REPEAT]      │ 1 │   │ 2 │   │ 3 │   │ 4 │   │ 5 │   │ 6 │   │ 7 │   │ 8 │  PADS       │                 │
│                     └───┘   └───┘   └───┘   └───┘   └───┘   └───┘   └───┘   └───┘             │                 │
└───────────────────────────────────────────────────────────────────────────────────────────────┴─────────────────┘
```

---

## 6. Functional Specification of All 7 Modules

### 6.1. SYNC Module
- **1. INTERNAL:** Uses internal crystal timer with 0.1 BPM resolution.
- **2. MIDI:** Slave sync to external MIDI Clock (24 PPQN), Start, Stop, Continue.
- **3. SMPTE:** Read/Write 30 fps drop/non-drop frame timecode from analog input jack.
- **4. CLICK:** 24 PPQN analog pulse clock input/output.

### 6.2. SAMPLE Module
- **1. VU Mode:** Activates real-time audio input peak meter on the LCD.
- **2. Assign Voice:** Directs incoming sample to a specific Pad slot (A1 through D8).
- **3. Input Level:** Software attenuator / gain trim for recording preamp.
- **4. Threshold:** Sets auto-trigger threshold dB value to begin recording on audio onset.
- **5. Sample Length:** Allocates sampling duration (0.1 to 2.50 seconds).
- **6. Re-sample:** Triggers a re-take using previous settings.
- **7. Arm Sample:** Waits for threshold exceedance to start recording.
- **8. Force Sample:** Bypasses threshold; immediately begins recording upon button press.

### 6.3. DISK Module
- **1. Load All:** Loads all 32 sounds, 100 segments, and 100 songs from disk image.
- **2. Save All:** Writes complete memory bank to virtual 3.5" DD (720KB) floppy image.
- **3. Catalog Disk:** Displays directory of sound names and sequence banks.
- **4. Format Disk:** Formats disk structure.
- **5. Copy Software:** System software utility.
- **6. Load Sound:** Loads single sound to selected pad.
- **7. Save Sound:** Writes single sound to disk.
- **8. Erase Disk:** Wipes virtual disk file.

### 6.4. SET-UP Module
- **11. Multi-Pitch:** Spreads a selected sound across all 8 pads in chromatically stepped pitches (Pad 1 highest $\rightarrow$ Pad 8 lowest).
- **12. Multi-Level:** Spreads a selected sound across all 8 pads in progressive velocity steps (Pad 1 softest $\rightarrow$ Pad 8 loudest).
- **13. Exit Multi-Mode:** Restores pads to standard 8 independent bank sounds.
- **14. Dynamic Buttons:** Toggles velocity sensitivity mode on/off.
- **15. Store Mix:** Saves current 8 channel fader mix into one of 8 Mix registers.
- **16. Select Mix:** Recalls a stored Mix register.
- **17. Channel Assign:** Reroutes any of the 32 sounds to output channel 1–8.
- **18. Decay/Tune Select:** Configures whether channel sliders edit Pitch or Decay Envelope.
- **19. Truncate / Loop:** Sets sample start, sample end, and loop points with sample-accurate trim.
- **20. Delete Sound:** Erases sound from RAM and reclaims memory.
- **21. MIDI Parameters:** Sets Omni/Poly mode, base receive channel, note mappings.
- **22. Dynamic Allocation:** Voice borrowing priority algorithm.
- **23. Special Functions:**
  - `11`: Catalog functions
  - `12`: Clear all memory
  - `13`: Check remaining memory (% sequence, seconds sample)
  - `14`: Write SMPTE
  - `15`: Clear sound memory
  - `16`: Clear sequence memory
  - `17`: Copy sound
  - `18`: Swap sounds
  - `19`: Default decay
  - `20`: Init DK/Tune
  - `21`: Name sound (6-letter name + 3-letter abbreviation)
  - `22`: Dynamic allocation
  - `23`: MIDI Sample Dump Standard (SDS) transmit

### 6.5. MASTER CONTROL Module
- **2×16 Alphanumeric Character LCD:**
  - Warm amber-green backlight (`oklch(0.82 0.12 115)`).
  - 5×8 dot-matrix character cells.
  - Top Line: Status / Menu / Function name (e.g., `SEGMENT: 01`, `BPM: 092.4`).
  - Bottom Line: Parameter value, bar-graph meter, or prompt (`ENTER VALUE: 18`).
- **Numeric Keypad:** 0–9 tactile momentary pushbuttons.
- **Control Keys:** `ENTER`, `YES`, `NO`, `<-` (Left), `->` (Right), `TEMPO`.
- **Rotary Pots:**
  - `MIX VOLUME`: Master analog output level.
  - `METRONOME VOLUME`: Analog click & system beep level.

### 6.6. PROGRAMMING Module (Sequencer)
- **Segment / Song Toggle Button** with dual-color LED.
- **8 Soft Buttons with Dual Silkscreen Functionality:**
  - In **Segment Mode:**
    1. `AUTO CORRECT`: Quantize resolution (Off, 1/8, 1/8T, 1/16, 1/16T, 1/32, 1/32T).
    2. `TIME SIGNATURE`: Meter (e.g. 4/4, 3/4, 6/8, 5/4).
    3. `LENGTH`: Segment bar length (1 to 99 bars).
    4. `METRONOME`: Click rate (1/4, 1/8, 1/16).
    5. `ERASE`: Real-time note erase when held down with pad.
    6. `STEP`: Step editor (advance step by step with arrow keys).
    7. `COPY`: Duplicate or append segment.
    8. `SWING`: Swing percentages (54%, 58%, 62%, 67%, 71%).
  - In **Song Mode:**
    1. `TRIGGER`: Select segment for current step.
    2. `REPEAT`: Set segment repeat count.
    3. `END`: Mark end of song sequence.
    4. `INSERT`: Insert segment into song list.
    5. `DELETE`: Delete segment step from song.
    6. `MIX`: Assign mix preset change to step.
    7. `TEMPO`: Assign tempo change to step.
    8. `STEP`: Step through song events.

### 6.7. PERFORMANCE Module
- **8 Channel Sliders:** Long-throw vertical faders with white center line indicator.
- **Mode Button:** Cycles through `TUNE/DECAY`, `MIX`, and `MULTI-MODE`.
- **Bank Select Button:** Cycles through Banks `A`, `B`, `C`, and `D` (8 pads × 4 banks = 32 sounds).
- **Transport Buttons:**
  - `RUN / STOP`: Starts/stops playback from current measure.
  - `RECORD`: Overdubs incoming pad events into active segment.
  - `TAP / REPEAT`: In tempo mode, taps BPM. In play mode, repeats selected pad at current quantize rate.
- **8 Drum Play Pads:** Large square black rubber pads with tactile mechanical actuation.

---

## 7. Binary Decision Trees for Implementation

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DSP ENGINE IMPLEMENTATION DECISION                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   [ Option A: Pure JS / WebAudio ]       [ Option B: Rust/WASM + AudioWorklet ] (SELECTED)
   - High garbage collector jitter        - Guaranteed zero GC pauses in audio thread
   - Variable timing on resize            - High-precision Runge-Kutta 4th order solver
   - Linear interpolation only            - Exact bit-accurate 12-bit ZOH drop-sampling
```

```
┌─────────────────────────────────────────────────────────────┐
│ 2. FACEPLATE CONSOLE LAYOUT DECISION                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   [ Option A: Generic DAW / 808 Style ]   [ Option B: 1:1 Hardware Replication ] (SELECTED)
   - 16 step buttons row (Inauthentic!)   - 8 Channel Sliders + 8 Drum Play Pads
   - Single vertical fader (Wrong!)       - 7 Complete Silkscreen Modules
   - 2x4 pad grid (Incorrect!)            - 4 Sound Banks (A, B, C, D)
                                          - Exact 2x16 Alphanumeric Backlit LCD
```

```
┌─────────────────────────────────────────────────────────────┐
│ 3. TIMING & SEQUENCER SCHEDULING DECISION                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   [ Option A: window.setInterval ]       [ Option B: AudioContext.currentTime ] (SELECTED)
   - Drifts under tab throttling          - Hardware sample-accurate lookahead clock
   - Unusable for musical swing           - 96 PPQN internal tick resolution
                                          - Tone.js Transport integration
```

---

## 8. Staged Engineering Roadmap & Verification Gates

### Stage 1: Mathematical DSP Core & AudioWorklet (`audio-engine`)
- [x] Service manual and schematics verified.
- [ ] Implement `sp1200-processor.ts` AudioWorklet:
  - 12-bit quantizer and 26.041666 kHz resampling buffer.
  - Phase accumulator drop-sampling / zero-order hold pitch shifter.
  - 8-channel SSM2044 / SSI2144 4-pole dynamic filter algorithm on Ch 1-2.
  - Static reconstruction filter simulation on Ch 3-6.
- **Verification Gate:** Passing sine-sweep test proves anti-aliasing cutoff and down-pitch aliasing harmonic clusters matching hardware analyzer traces.

### Stage 2: 1:1 Hardware Faceplate Component Architecture (`faceplate-ui`)
- [ ] Replace temporary DAW / 808 hybrid components with the 1:1 E-mu SP-1200 physical layout:
  - Top 4 Modules: `SYNC`, `SAMPLE`, `DISK`, `SET-UP` with exact silkscreen typography.
  - Top Right: `MASTER CONTROL` with 2×16 LCD, numeric keypad, volume pots, cursor/enter buttons.
  - Middle: `PROGRAMMING` module with `SEGMENT/SONG` toggle and 8 dual-labeled function buttons.
  - Lower Half: `PERFORMANCE` module with 8 Channel Sliders, 8 Drum Play Pads, Bank `A/B/C/D` selector, `TUNE/MIX/MULTI` selector, and Transport controls.
  - Right: 3.5" Floppy Disk drive bezel.
- **Verification Gate:** Visual inspection aligns 1:1 with E-mu SP-1200 front panel photographs and official service manual layout diagram.

### Stage 3: Microcontroller State Engine & Menu Navigation (`state-engine`)
- [ ] Implement 2×16 LCD menu matrix corresponding to all function numbers (11–23 for Set-Up, 1–8 for Disk, etc.).
- [ ] Keypad data entry with leading zeros, YES/NO prompts, and slider bar-graph visualizer.
- [ ] Bank switching (A, B, C, D) across 32 sample memory locations.
- **Verification Gate:** Entering `SET-UP 18` or `SET-UP 11` on the keypad displays the exact hardware menu and engages the proper slider mode.

### Stage 4: 96 PPQN Sequencer & Song Mode (`sequencer`)
- [ ] Segment recording in real time with auto-correct (quantize) and swing profiles (54% to 71%).
- [ ] Note repeat via `TAP/REPEAT` button.
- [ ] Song mode chaining of segments with tempo and mix memory overrides.
- **Verification Gate:** Recording a 4-bar break with swing plays back with zero jitter and matches vintage SP-1200 groove timing.

### Stage 5: Disk Image Management & Floppy Emulation (`disk-persistence`)
- [ ] 720KB virtual floppy disk image (.hfe / raw dump / JSON) import and export.
- [ ] IndexedDB virtual disk drive persistence.
- **Verification Gate:** Saving a bank to virtual disk, clearing memory with `Special 12`, and reloading from disk restores all 32 sounds, segments, and song arrangements perfectly.

---

## 9. Conclusion

This document forms the single, permanent technical blueprint for the E-mu SP-1200 replica. Any future contributor can review this specification, inspect the mathematical models and front panel definitions, and implement or refine any module with complete fidelity to the original 1987 instrument.
