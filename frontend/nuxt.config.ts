import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    // from https://github.com/vite-pwa/nuxt?tab=readme-ov-file#-usage
    '@vite-pwa/nuxt'
  ],
  vite: {
    plugins: [
      vuetify({ autoImport: true })
    ],
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    }
  },
  app: {
    head: {
      link: [
        { rel:"manifest", href:"/manifest.webmanifest"  }
      ]
    }
  },
  ssr: false,
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
  },
  runtimeConfig: {
    public: {
      apiBase: ''
    }
  },
  compatibilityDate: '2026-10-07',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 5,
  },
})
