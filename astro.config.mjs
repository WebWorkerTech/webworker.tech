import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import vue from '@astrojs/vue'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://webworker.tech',
  integrations: [vue()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),

  vite: {
    plugins: [tailwindcss()],
  },
})
