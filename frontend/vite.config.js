import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // --- START OF NEW CODE --- (1. Import)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // --- START OF NEW CODE --- (2. Add and configure the plugin)
    VitePWA({
      registerType: 'autoUpdate',
      // The manifest is the "ID card" of your PWA.
      manifest: {
        name: 'Citizen Hub',
        short_name: 'CitizenHub',
        description: 'A management system for citizen documents and vehicle records.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // This helps with adaptive icons on Android
          }
        ]
      }
    })
    // --- END OF NEW CODE ---
  ],
})
