import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      srcDir: 'src',
      filename: 'service-worker.js',
      strategies: 'injectManifest',
      injectManifest: {
        swSrc: 'src/service-worker.js',
        swDest: 'service-worker.js',
      },
      manifest: {
        name: 'Brasilit',
        short_name: 'Brasilit',
        description: 'Sistema de Gestão de Inspeções',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'brasilit-icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'brasilit-icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'brasilit-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-*'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    'process.env': process.env
  }
});

// Arquivo removido para padronização Cloudflare. Utilize apenas vite.config.ts
