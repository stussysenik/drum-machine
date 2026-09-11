# Spec: Faceplate — 1:1 E-mu SP-1200 Hardware Visual Design System

## POV
The browser window IS the E-mu SP-1200 chassis. The console scales uniformly and centers in the viewport. Every single visual element, button, slider, and silkscreen menu is a direct 1:1 reference to the physical 1987 hardware unit.

---

## 1. Physical Layout Geometry & Proportions
- **Form Factor:** Heavy-duty, industrial desktop / rack-mountable drum machine chassis.
- **Proportions:** ~4:3 aspect ratio matching the authentic top-down SP-1200 front panel perspective.
- **Enclosure Detailing:**
  - 4 corner hex/cross-head chassis screws.
  - Horizontal ventilation louvers on the upper left and right chassis wings.
  - Recessed front-panel sub-chassis with raised perimeter bezel.
  - 3.5" Floppy disk drive cut-out with simulated disk slot, eject button, and disk access LED.

---

## 2. The 7 Hardware Modules (Exact Spatial Map)

### Zone 1: Upper Silkscreen Function Matrix (Top Left to Center)
Divided into 4 distinct framed white-silkscreen command modules:
1. **SYNC:**
   - `1. INTERNAL`
   - `2. MIDI`
   - `3. SMPTE`
   - `4. CLICK`
2. **SAMPLE:**
   - `1. VU MODE`
   - `2. ASSIGN VOICE`
   - `3. INPUT LEVEL`
   - `4. THRESHOLD`
   - `5. SAMPLE LENGTH`
   - `6. RE-SAMPLE`
   - `7. ARM SAMPLE`
   - `8. FORCE SAMPLE`
3. **DISK:**
   - `1. LOAD ALL`
   - `2. SAVE ALL`
   - `3. CATALOG DISK`
   - `4. FORMAT DISK`
   - `5. COPY SOFTWARE`
   - `6. LOAD SOUND`
   - `7. SAVE SOUND`
   - `8. ERASE DISK`
4. **SET-UP:**
   - `11. MULTI-PITCH`
   - `12. MULTI-LEVEL`
   - `13. EXIT MULTI-MODE`
   - `14. DYNAMIC BUTTONS`
   - `15. STORE MIX`
   - `16. SELECT MIX`
   - `17. CHANNEL ASSIGN`
   - `18. DECAY/TUNE SELECT`
   - `19. TRUNCATE / LOOP`
   - `20. DELETE SOUND`
   - `21. MIDI PARAMETERS`
   - `22. DYNAMIC ALLOC`
   - `23. SPECIAL FUNCTIONS`

### Zone 2: Master Control Module (Top Right)
- **2×16 Alphanumeric Character LCD:**
  - Warm amber-green fluorescent backlight glow (`oklch(0.82 0.12 115)`).
  - High-contrast 5×8 dot-matrix character cells with visible segment grid lines.
  - Displays mode, segment/song number, tempo, memory gauge, and parameter values.
- **Rotary Volume Knobs:**
  - `MIX VOLUME`: Controls master audio level.
  - `METRONOME VOLUME`: Controls click level and hardware beep feedback.
- **10-Key Numeric Keypad:**
  - Buttons `[7] [8] [9]`, `[4] [5] [6]`, `[1] [2] [3]`, `[0]`.
  - Confirmation buttons: `[YES]`, `[NO]`, `[ENTER]`.
  - Navigation buttons: `[<]` (Left Arrow), `[>]` (Right Arrow).
  - Dedicated `[TEMPO]` key.

### Zone 3: Programming Module (Center Middle)
- **Mode Toggle:** `[SEGMENT / SONG]` button with status LED.
- **8 Soft Function Buttons with Dual Silkscreen Labels:**
  - Above buttons (**SONG MODE**):
    `[1. TRIGGER] [2. REPEAT] [3. END] [4. INSERT] [5. DELETE] [6. MIX] [7. TEMPO] [8. STEP]`
  - Below buttons (**SEGMENT MODE**):
    `[1. AUTO-CORR] [2. TIME-SIG] [3. LENGTH] [4. METRONOME] [5. ERASE] [6. STEP] [7. COPY] [8. SWING]`

### Zone 4: Performance Module — Faders & Pads (Lower Center)
- **8 Channel Sliders (Sliders 1 through 8):**
  - Long-throw vertical faders positioned directly above their corresponding drum pad.
  - Silkscreened level markings with white center detent line.
  - Controlled by the `MODE` button:
    - In `MIX` mode: controls volume of voices 1 to 8.
    - In `TUNE/DECAY` mode: controls pitch or decay envelope of voices 1 to 8.
    - In `MULTI-MODE`: controls per-pad pitch intervals or dynamic velocity values.
- **8 Drum Play Pads (Pads 1 through 8):**
  - Authentic large rectangular black tactile rubber pads.
  - Tactile travel with physical depression animation on strike.
  - Subtle red backlight ring at rim edge upon actuation.
- **Mode Selector & Bank Selector (Left of Faders/Pads):**
  - `MODE` button cycling 3 LED indicators:
    - `TUNE / DECAY`
    - `MIX`
    - `MULTI-MODE`
  - `BANK SELECT` button cycling 4 bank LEDs:
    - `BANK A` (Sounds 1–8)
    - `BANK B` (Sounds 9–16)
    - `BANK C` (Sounds 17–24)
    - `BANK D` (Sounds 25–32)
- **Transport Section:**
  - `[RUN / STOP]` with green/red run status LED.
  - `[RECORD]` with red recording LED.
  - `[TAP / REPEAT]` for live tempo tapping and automated note repeat rolls.

### Zone 5: Disk Drive & Branding (Lower Right)
- **3.5" Floppy Disk Drive:**
  - Metal casing bezel, black disk insert slot, mechanical eject button, and red disk activity LED.
- **Nameplate / Badge:**
  - Industrial metallic badge: `E-mu Systems, Inc. | SP-1200 Sampling Percussion System`.

---

## 3. Materials, Palette & Typography

### 3.1. Color Tokens
- **Faceplate Base:** Vintage E-mu warm charcoal dark gray: `oklch(0.28 0.01 60)` / `#2c2c2f`.
- **Faceplate Trim / Recesses:** Darker metallic shadow: `oklch(0.20 0.01 60)` / `#1e1e21`.
- **Silkscreen Labels:** High-opacity matte silkscreen white / warm bone: `oklch(0.92 0.01 80)` / `#e8e8e2`.
- **Sub-Labels & Menu Numbers:** Subtle metallic cyan / light gray: `oklch(0.78 0.03 210)`.
- **Pads:** Matte vulcanized black rubber with bevel edge: `oklch(0.18 0.005 50)` / `#18181a`.
- **LCD Display Backlight:** 1987 green-amber fluorescent glow: `oklch(0.82 0.12 115)` / `#b2cc3e`.
- **LCD Pixel Characters:** Dark liquid-crystal black-green: `oklch(0.22 0.04 120)` / `#1d2810`.
- **LED Indicators:** Vintage single-color phosphor RED: `oklch(0.62 0.22 25)` / `#e62b2b`.

### 3.2. Typography System
1. **Silkscreen Lettering:** DIN 1451 / Bahnschrift condensed bold, all-caps, tight tracking, crisp industrial alignment.
2. **LCD Text:** Fixed 5×8 cell dot-matrix pixel font (e.g. "Fusion Pixel" / dot-matrix SVG).

---

## 4. Tactile Feedback & Interaction Rules
- **Pointer Events:** Instant low-latency `pointerdown` response.
- **Double-Tap Zoom Disabled:** `touch-action: manipulation`.
- **Text Selection Suppressed:** `user-select: none`.
- **Slider Dragging:** Dragging any of the 8 sliders provides immediate visual bar-graph feedback on the 2×16 LCD display.
