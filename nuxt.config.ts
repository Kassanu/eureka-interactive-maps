import { DEFAULT_LOCALE, LOCALES } from './i18n/locales'
import { localizedRoutes } from './i18n/routes'
import { SITE_NAME } from './site'
import { zoneSlugs } from './zones'

// The map routes are dynamic, so the crawler cannot find them by shape. Naming them from the
// registry is what keeps a zone added there from shipping unprerendered.
const routes = [
  '/',
  '/contribute',
  '/changelog',
  ...zoneSlugs.flatMap(slug => [`/map/${slug}`, `/map/${slug}/edit`]),
]

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: localizedRoutes(routes),
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
  // Browser detection is on by default and would redirect a visitor away from the URL they asked
  // for. Googlebot crawls from the US in English, so an unconditional redirect can hide every
  // localized page from the index.
  i18n: {
    locales: LOCALES.map(locale => ({ ...locale, file: `${locale.code}.json` })),
    defaultLocale: DEFAULT_LOCALE,
    strategy: 'prefix_except_default',
    langDir: 'locales',
    detectBrowserLanguage: false,
  },
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  css: [
    '~/assets/css/tailwind.scss',
    'eureka-canvas/dist/index.css'
  ]
})
