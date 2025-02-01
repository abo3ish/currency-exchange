// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  devServer: {
    port: 3001
  },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
       API_URL: process.env.API_URL,
    }
  }
})
