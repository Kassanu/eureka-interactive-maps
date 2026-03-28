// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    vite: {
      optimizeDeps: {
        include: ['eureka-canvas']
      },
    },
    app: {
    head: {
      title: 'FFXIV Interactive Eureka Maps',
      meta: [
        {
          name: 'description',
          content: 'Explore detailed, high-quality maps of FFXIV’s Field Operations Eureka, Bozja, and Occult Crescent. Filter data to see drops, enemies, events, and more!'
        },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
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
