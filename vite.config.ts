import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/Love-attached/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Love Attached',
        short_name: 'Love Attached',
        description: 'A simple, voice-first way to pass treasured belongings to loved ones, with a story and a personal note attached to each one.',
        theme_color: '#9A3A4C',
        background_color: '#FBF7EF',
        display: 'standalone',
        start_url: '/Love-attached/',
        scope: '/Love-attached/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
      },
    }),
  ],
})
