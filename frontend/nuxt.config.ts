import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    transpile: ['vuetify'],
  },
  runtimeConfig: {
    public: {
      apiBase: 'https://transposer.glynnbird.com'
    }
  },
  ssr: false,
  modules: [
    '@vite-pwa/nuxt',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    //...
  ],
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  pwa: {
    strategies: 'generateSW',
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    manifest: {
      "name": "Transposer",
      "short_name": "Transposer",
      "icons": [
        {
          "src": "/note-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "/note-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ],
      "theme_color": "#9C27B0",
      "background_color": "#FFFFFF",
      "display": "standalone"
    }
  }
})
