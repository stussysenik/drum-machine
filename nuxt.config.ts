export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt'
  ],
  unocss: {
    attributify: true,
    wind: true
  },
  app: {
    head: {
      title: 'SP-1200 | Essentialist Drum Machine',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'SP-1200 hardware emulation - 12-bit, 26.04kHz, modular signal path' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap' }
      ]
    }
  },
  css: ['~/assets/css/main.css'],
  vite: {
    build: {
      target: 'esnext'
    }
  }
})
