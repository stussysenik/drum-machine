# Spec: Product Overview — 1:1 E-mu SP-1200 Hardware Replica

## One Sentence
A faithful, 1:1 functional software replica of the E-mu SP-1200 sampling drum computer, capturing every analog circuit behavior, drop-sample aliasing artifact, and front-panel hardware workflow down to the exact silkscreen and pixel.

---

## The 22 Design Decisions (Binary Tree, All Resolved)

| # | Branch | Decision | Rationale |
|---|--------|----------|-----------|
| 1 | Visual Language | **A — 1:1 Physical Hardware Console** | Every knob, slider, pad, screw, and silkscreen list matches the real unit. |
| 2 | Layout Container | **A — Centered Desktop Chassis (~4:3)** | Preserves the top-down perspective of the physical machine. |
| 3 | Performance Controls | **A — 8 Channel Sliders + 8 Large Pads** | The signature tactile heart of the SP-1200. |
| 4 | Bank Architecture | **A — 4 Sound Banks (A, B, C, D)** | Exactly 32 sounds total (8 sounds × 4 banks), selected via Bank switch. |
| 5 | Data Entry & Nav | **A — 10-Key Numeric Pad + LCD** | Menu navigation matches the hardware function codes (11-23, etc.). |
| 6 | Display Subsystem | **A — 2×16 Dot-Matrix Backlit LCD** | Green-amber fluorescent backlight, 5×8 character cells. |
| 7 | Faceplate Finish | **A — Exact SP-1200 Charcoal Gray** | Dark warm-grey (`#2c2c2f`) with crisp white silkscreen typography. |
| 8 | Programming Strip | **A — Dual-Mode Function Buttons (1–8)** | Song mode functions on top, Segment mode functions on bottom. |
| 9 | Storage Emulation | **A — Virtual 3.5" Floppy Disk Drive** | 720KB disk image saves/loads with disk activity LED and eject sound. |
| 10 | Material Detailing | **A — High-Detail Industrial Finish** | Corner screws, ventilation louvers, rubber pads, and metal bezels. |
| 11 | Illumination System| **A — Vintage Single-Color Red LEDs** | Warm red phosphors for banks, modes, run/stop, and record. |
| 12 | Pad Hit Feedback | **A — Physical Travel + Subtle Red Glow** | Tactile mechanical depression on strike. |
| 13 | Color Palette | **A — Authentic E-mu Colorway** | Charcoal chassis, white silkscreen, red LEDs, green-amber LCD. |
| 14 | Typography | **A — DIN 1451 Silkscreen + Dot-Matrix LCD** | Exact technical font for all chassis labels. |
| 15 | Slider Mechanics | **A — 8 Long-Throw Channel Sliders** | Center detents, scale ticks, and live LCD graph updates. |
| 16 | Transport Buttons | **A — RUN/STOP, RECORD, TAP/REPEAT** | Exact hardware sequencer controls. |
| 17 | Audio Engine Core | **A — Sample-Accurate AudioWorklet** | Dedicated audio thread; immune to DOM reflows and window resize. |
| 18 | Digital Pitching | **A — Zero-Order Hold Drop-Sampling** | 26.041666 kHz crystal clock, phase accumulator skipping (no interpolation). |
| 19 | Quantization | **A — 12-Bit Linear Signed PCM** | Authentic dynamic range (72 dB) and truncation grit. |
| 20 | Analog Filter DSP | **A — Discrete Channel Path Modeling** | Ch 1-2: SSM2044 dynamic 24dB LPF; Ch 3-6: Static LPF; Ch 7-8: Direct out. |
| 21 | Sequencer Engine | **A — 96 PPQN Lookahead Clock** | 100 segments, 100 songs, real-time swing (54%–71%) & auto-correct. |
| 22 | Persistence | **A — IndexedDB + Disk Image Export/Import**| Complete machine state survives page refresh and can be shared. |

---

## Hardware Constraints (Creative Features)
- **Clock & Sample Rate:** Exactly $26041.6667 \text{ Hz}$.
- **Word Length:** 12-bit linear PCM ($[-2048, 2047]$).
- **Sound Memory:** 256K words ($10.04 \text{ seconds}$ total across 4 banks of $2.51 \text{s}$).
- **Polyphony:** 8 monophonic voices assigned across 8 output channels.
- **Transposition:** Zero-order hold sample drop / repeat (aliasing artifacts preserved).

---

## Technology Stack
- **Framework:** Nuxt 3 (Vite, Vue 3, TypeScript, `ssr: false`).
- **Styling:** UnoCSS with custom hardware color tokens and component shortcuts.
- **Audio Clock:** Tone.js Lookahead Transport (`AudioContext.currentTime`).
- **DSP Processing:** Custom Web Audio `AudioWorkletNode` (`sp1200-processor`).
- **Filter Modeling:** 4th-order Runge-Kutta differential equation solver for SSM2044 VCF.
- **State Management:** Pinia (UI state only — strictly decoupled from audio clock).
- **Persistence:** Local IndexedDB virtual disk library.
