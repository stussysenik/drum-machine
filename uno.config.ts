import { defineConfig, presetWind, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetWind(),
    presetAttributify()
  ],
  theme: {
    colors: {
      // SP-1200 Hardware Palette - warm analog, no RGB candy
      'sp-bg': '#0a0a08',
      'sp-surface': '#141410',
      'sp-raised': '#1c1c16',
      'sp-active': '#2a2a20',
      'sp-border': '#2a2a22',
      'sp-border-active': '#4a4a3a',
      'sp-text': '#c8c4a8',
      'sp-text-dim': '#8a8668',
      'sp-text-muted': '#5a5648',
      'sp-accent': '#d4c86a',
      'sp-accent-bright': '#e8d878',
      'sp-pad': '#3a3428',
      'sp-pad-active': '#8a7a3a',
      'sp-meter-low': '#3a4a2a',
      'sp-meter-mid': '#6a7a3a',
      'sp-meter-clip': '#c84838'
    },
    fontFamily: {
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      '2xs': ['0.625rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
      xs: ['0.6875rem', { lineHeight: '1.125rem', letterSpacing: '0.05em' }],
      sm: ['0.75rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
      base: ['0.8125rem', { lineHeight: '1.375rem' }]
    },
    spacing: {
      '0.5': '0.125rem',
      '1.5': '0.375rem',
      '2.5': '0.625rem',
      '3.5': '0.875rem'
    }
  },
  shortcuts: {
    // Hardware panel
    'hw-panel': 'bg-sp-surface border border-sp-border p-2',
    'hw-label': 'text-2xs uppercase tracking-widest text-sp-text-muted font-medium mb-1.5',
    'hw-display': 'bg-sp-bg border border-sp-border px-2 py-1 text-xs text-sp-accent uppercase tracking-wider',
    'hw-btn': 'bg-sp-raised border border-sp-border text-sp-text-dim px-2 py-1 text-2xs uppercase tracking-wider cursor-pointer hover:border-sp-border-active hover:text-sp-text active:bg-sp-active active:border-sp-accent active:text-sp-accent transition-colors duration-75',
    'hw-btn-active': 'bg-sp-active border-sp-accent text-sp-accent',
    'hw-knob': 'w-8 h-8 rounded-full bg-sp-raised border border-sp-border relative cursor-pointer',
    'hw-toggle': 'w-4 h-4 bg-sp-raised border border-sp-border cursor-pointer',
    'hw-toggle-on': 'bg-sp-accent',
    'hw-step': 'aspect-square bg-sp-pad border border-sp-raised cursor-pointer hover:border-sp-border-active transition-colors duration-50',
    'hw-step-active': 'bg-sp-accent',
    'hw-step-playing': 'bg-sp-accent-bright shadow-[0_0_4px_var(--un-shadow-color)]',
    'hw-pad': 'w-16 h-16 bg-sp-pad border border-sp-border flex items-center justify-center cursor-pointer text-2xs uppercase tracking-tight text-sp-text-dim transition-colors duration-50',
    'hw-pad-active': 'bg-sp-pad-active text-sp-text',
    'hw-pad-playing': 'bg-sp-accent-bright text-sp-bg border-sp-accent-bright'
  }
})
