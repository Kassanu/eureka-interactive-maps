import { SITE_NAME } from './site'
import { zoneSlugs } from './zones'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // The map routes are dynamic, so the crawler cannot find them by shape. Naming them from the
  // registry is what keeps a zone added there from shipping unprerendered.
  nitro: {
    prerender: {
      routes: zoneSlugs.flatMap(slug => [`/map/${slug}`, `/map/${slug}/edit`]),
    },
  },
  vite: {
    optimizeDeps: {
      include: ['eureka-canvas']
    },
  },
  app: {
    head: {
      title: SITE_NAME,
      htmlAttrs: { lang: 'en' },
      meta: [
        {
          name: 'description',
          content: "Explore detailed, high-quality maps of FFXIV's Field Operations Eureka, Bozja, and Occult Crescent. Filter data to see drops, enemies, events, and more!"
        },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
      ]
    }
  },
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss'],
  css: [
    '~/assets/css/tailwind.scss',
    'eureka-canvas/dist/index.css'
  ]
})
