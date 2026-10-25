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
      // The default injected registerSW.js just calls .register() and
      // relies on the browser's own, heavily-throttled (often ~24h)
      // background check for a new service worker -- on iOS Safari in
      // particular that can leave a visitor stuck on a stale cached
      // build for a long time after a new one ships, even with
      // skipWaiting/clientsClaim on (those only matter once an update
      // is actually detected). Registering manually instead lets us
      // force an explicit update check on every load and whenever the
      // tab becomes visible again, in src/registerSW.ts.
      injectRegister: false,
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
