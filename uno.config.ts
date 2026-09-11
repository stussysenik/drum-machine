import { defineConfig, presetWind, presetAttributify } from 'unocss'

// Master color definitions for E-mu SP-1200 hardware reproduction
const spColors = {
  // Faceplate: dark warm-grey, NOT pure black. Approx #2b2b2e
  'faceplate': '#2c2c2f',
  'sp-faceplate': '#2c2c2f',
  'faceplate-dark': '#202023',
  'sp-faceplate-dark': '#202023',
  'faceplate-light': '#3c3c40',
  'sp-faceplate-light': '#3c3c40',
  'chassis': '#161618',
  'sp-chassis': '#161618',

  // Rubber pads (Pads 1-8)
  'pad': '#1a1a1c',
  'sp-pad': '#1a1a1c',
  'pad-press': '#101012',
  'sp-pad-press': '#101012',
  'pad-rim': '#323236',
  'sp-pad-rim': '#323236',
  'pad-glow': '#cc2020',
  'sp-pad-glow': '#cc2020',

  // Buttons
  'btn': '#3a3a3e',
  'sp-btn': '#3a3a3e',
  'btn-press': '#28282b',
  'sp-btn-press': '#28282b',
  'btn-active': '#4f4f54',
  'sp-btn-active': '#4f4f54',

  // LCD: 1987 green-amber fluorescent display
  'lcd-bg': '#1b2310',
  'sp-lcd-bg': '#1b2310',
  'lcd-glow': '#a2bc38',
  'sp-lcd-glow': '#a2bc38',
  'lcd-dim': '#455416',
  'sp-lcd-dim': '#455416',

  // Vintage Red LEDs
  'led-red': '#ff2222',
  'sp-led-red': '#ff2222',
  'led-dim': '#881515',
  'sp-led-dim': '#881515',
  'led-off': '#281010',
  'sp-led-off': '#281010',

  // Channel Sliders (1 to 8)
  'fader-track': '#161618',
  'sp-fader-track': '#161618',
  'fader-cap': '#545458',
  'sp-fader-cap': '#545458',
  'fader-cap-hi': '#6e6e74',
  'sp-fader-cap-hi': '#6e6e74',

  // White Silkscreen Labels
  'label': '#eae6dd',
  'sp-label': '#eae6dd',
  'label-dim': '#a6a29a',
  'sp-label-dim': '#a6a29a',
  'label-cyan': '#5aa2ba',
  'sp-label-cyan': '#5aa2ba',

  // Hardware Metal Finishing
  'screw': '#5c5c60',
  'sp-screw': '#5c5c60',
  'screw-slot': '#222225',
  'sp-screw-slot': '#222225',
  'bezel': '#424246',
  'sp-bezel': '#424246',
  'vent': '#1e1e21',
  'sp-vent': '#1e1e21',
}

export default defineConfig({
  presets: [
    presetWind(),
    presetAttributify()
  ],
  theme: {
    colors: spColors,
    fontFamily: {
      // Two-font system: Industrial DIN silkscreen + LCD dot matrix
      'silkscreen': ['"Bahnschrift Condensed"', '"DIN 1451"', '"Arial Narrow"', 'sans-serif'],
      'lcd': ['"Fusion Pixel 12px"', '"VT323"', '"Courier New"', 'monospace'],
      'mono': ['"JetBrains Mono"', 'monospace']
    }
  },
  shortcuts: {
    // 1:1 Hardware Console Enclosure
    'sp-console': 'relative bg-sp-faceplate overflow-hidden select-none touch-manipulation shadow-2xl border border-sp-chassis',
    'sp-console-inner': 'relative w-full h-full flex flex-col p-4 gap-3',

    // Module Frame Borders
    'sp-module-box': 'border-t-2 border-sp-label-cyan p-0.5 relative',
    'sp-module-title': 'font-silkscreen font-bold tracking-wide text-sp-label text-xs uppercase',

    // Hardware Buttons
    'sp-btn-tactile': 'bg-[#eeece7] hover:bg-white active:bg-[#c9c7c2] border border-[#b6b4af] rounded-none px-2.5 py-1 text-[10px] font-silkscreen font-bold uppercase tracking-wider text-[#202024] cursor-pointer shadow-sm active:translate-y-px transition-all',
    'sp-btn-keypad': 'bg-[#eeece7] hover:bg-white active:bg-[#c9c7c2] border border-[#b6b4af] rounded-none w-8 h-8 flex items-center justify-center text-xs font-silkscreen font-bold text-[#202024] cursor-pointer shadow active:translate-y-px',

    // Drum Play Pads (Pads 1-8)
    'sp-play-pad': 'relative bg-sp-pad hover:bg-sp-pad/90 active:bg-sp-pad-press rounded-none border-2 border-sp-pad-rim cursor-pointer transition-all active:scale-[0.98] shadow-md flex flex-col items-center justify-center',

    // 2x16 Alphanumeric Character LCD
    'sp-lcd-screen': 'bg-sp-lcd-bg border-2 border-sp-faceplate-dark rounded px-3 py-2 font-lcd shadow-inner',
    'sp-lcd-text': 'text-sp-lcd-glow tracking-[0.16em] text-sm leading-tight font-bold',

    // Screws and Chassis Details
    'sp-chassis-screw': 'w-3 h-3 rounded-full bg-sp-screw border border-sp-screw-slot relative flex items-center justify-center shadow-sm',
  }
})
