// vitest's defineConfig so the `test` block typechecks alongside vite options.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    // Honour an injected PORT so tooling can assign a free port.
    port: Number(process.env.PORT) || 5173,
    host: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'favicon.svg'],
      manifest: {
        name: 'Math Quest',
        short_name: 'Math Quest',
        description: 'Cute, offline-first GED math prep from foundational skills to test practice.',
        theme_color: '#fef7f9',
        background_color: '#fef7f9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  test: {
    // Stays `node` deliberately. `.tsx` is matched so a presentational component
    // can be rendered to a string with `renderToStaticMarkup` and asserted on;
    // anything needing a real DOM fails loudly here rather than passing by
    // accident, which is the boundary we want.
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'api/**/*.test.ts'],
  },
})
