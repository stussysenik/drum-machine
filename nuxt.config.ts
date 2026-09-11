export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt',
  ],
  unocss: {
    attributify: true,
  },
  app: {
    head: {
      title: 'SP-1200 | Hardware Sampler',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'description', content: 'Faithful web recreation of the E-mu SP-1200 — 12-bit, 26.04kHz, 8-voice sampler/sequencer' },
        { name: 'theme-color', content: '#3a3834' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=VT323&family=JetBrains+Mono:wght@400;500;600&family=Bahnschrift:wght@400;600&display=swap' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  vite: {
    build: {
      target: 'esnext',
    },
  },
})
