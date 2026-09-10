import { DEFAULT_LOCALE, LOCALES } from './i18n/locales'
import { siteRoutes } from './i18n/routes'
import { SITE_NAME, SITE_ORIGIN } from './site'
import { zoneSlugs } from './zones'

// The map routes are dynamic, so the crawler cannot find them by shape. Naming them from the
// registry is what keeps a zone added there from shipping unprerendered.
const localizedPaths = [
  '/',
  ...zoneSlugs.flatMap(slug => [`/map/${slug}`, `/map/${slug}/edit`]),
]

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: siteRoutes(localizedPaths),
    },
  },
  vite: {
    optimizeDeps: {
      include: ['eureka-canvas']
    },
  },
  // `lang`, the canonical, the alternates and the description come from app.vue instead: nothing
  // here can read the active locale.
  app: {
    head: {
      title: SITE_NAME,
      meta: [
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
    // Without this useLocaleHead emits no canonical and no alternates at all.
    baseUrl: SITE_ORIGIN,
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
