import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Brasilit Vistorias Técnicas',
        short_name: 'Brasilit',
        description: 'Sistema de Vistorias Técnicas da Brasilit - Saint-Gobain',
        theme_color: '#EE1B24',
        background_color: '#ffffff',
        icons: [
          {
            src: 'brasilit-icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'brasilit-icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'brasilit-icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'brasilit-icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        start_url: '/?source=pwa',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        id: '/', // Added from public/manifest.json
        categories: ['business', 'productivity', 'utilities'], // Added
        lang: 'pt-BR', // Added
        dir: 'ltr', // Added
        prefer_related_applications: false, // Added
        related_applications: [ // Added
          {
            platform: 'play',
            url: 'https://play.google.com/store/apps/details?id=com.brasilit.vistorias'
          },
          {
            platform: 'itunes',
            url: 'https://apps.apple.com/app/id0000000000' // Placeholder, update if actual URL exists
          }
        ],
        shortcuts: [ // Added
          {
            name: 'Nova Vistoria',
            short_name: 'Nova Vistoria',
            description: 'Iniciar uma nova vistoria técnica',
            url: '/inspection/new?source=shortcut',
            icons: [{ src: 'brasilit-icon-192.svg', sizes: '192x192' }] // Assuming main icon can be reused or specify shortcut-specific one
          },
          {
            name: 'Minhas Vistorias',
            short_name: 'Vistorias',
            description: 'Ver minhas vistorias em andamento e finalizadas',
            url: '/inspections?source=shortcut',
            icons: [{ src: 'brasilit-icon-192.svg', sizes: '192x192' }] // Assuming main icon can be reused
          }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.cloudflare\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudflare-assets',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/api\/inspections/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-inspections',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 dia
              },
              networkTimeoutSeconds: 10,
              method: 'GET' // Ensure only GET requests are cached by this strategy
            }
          },
          {
            urlPattern: /\/api\/clients/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-clients',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 dia
              },
              networkTimeoutSeconds: 10,
              method: 'GET'
            }
          },
          {
            urlPattern: /\/api\/projects/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-projects',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 dia
              },
              networkTimeoutSeconds: 10,
              method: 'GET'
            }
          },
          {
            urlPattern: /\/api\/auth\/me/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-auth-me',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 // 1 hora
              },
              networkTimeoutSeconds: 5,
              method: 'GET'
            }
          },
          {
            urlPattern: /\/api\/.*/, // General GET requests for other API data
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-other-data',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 12 // 12 horas
              },
              method: 'GET'
            }
          }
        ],
        navigationPreload: true,
        navigateFallback: '/offline.html', // Global offline fallback
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/] // Don't use fallback for API or static asset requests
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  build: {
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  define: {
    'process.env.CF_PAGES': JSON.stringify(process.env.CF_PAGES),
    'process.env.CF_PAGES_BRANCH': JSON.stringify(process.env.CF_PAGES_BRANCH)
  }
});