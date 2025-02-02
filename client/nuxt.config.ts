export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  devServer: {
    port: 3001
  },
  ssr: true,
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
       API_URL: process.env.API_URL,
    }
  },
  vite: {
    ssr: {
      noExternal: ['vue-select']
    }
  },
  tailwindcss: {
    config: {
      theme: {
        extend: {
          margin: {
            'start': 'margin-inline-start',
            'end': 'margin-inline-end'
          },
          padding: {
            'start': 'padding-inline-start',
            'end': 'padding-inline-end'
          }
        }
      },
      daisyui: {
        themes: ["light"],
        darkTheme: "light",
      }
    }
  },
})
