import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    transpile: ['vuetify'],
  },
  ssr: false,
  modules: [
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
  app: {
    head: { 
      link: [ { rel: 'manifest', href: '/transposer.webmanifest'} ],
      script: [ { src: 'https://cdn.jsdelivr.net/npm/pouchdb@9.0.0/dist/pouchdb.min.js'}]
    }
  }
})
