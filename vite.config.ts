import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Polaro It!",
        description: "Turn any photo into a Polaroid with Polaro It!",
        short_name: "Polaro It!",
        theme_color: "#FFE137",
        icons: [
          {
            src: "icon-36x36.png",
            sizes: "36x36",
            type: "image/png",
          },
          {
            src: "icon-48x48.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          }
        ],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '2662x1618',
            form_factor: 'wide',
            type: 'image/png'
          },
          {
            src: 'screenshot-narrow.png',
            sizes: '1442x3202',
            form_factor: 'narrow',
            type: 'image/png'
          },
        ]
      }
    })
  ],
  base: "https://ibrahimsyah.github.io/polaroit",
  build: {
    minify: 'terser'
  }
})
