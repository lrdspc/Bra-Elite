import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import themePlugin from '@replit/vite-plugin-shadcn-theme-json';
import path, { dirname } from 'path';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isReplit = process.env.REPL_ID !== undefined;

  // Configuração do VitePWA
  const pwaOptions = {
    // Configuração básica do PWA
    strategies: 'injectManifest' as const,
    srcDir: 'src',
    filename: 'service-worker.js',
    registerType: isProduction ? 'autoUpdate' as const : 'autoUpdate' as const,
    injectRegister: 'auto' as const,
    includeAssets: [
      'brasilit-icon-192-maskable.png', 
      'brasilit-icon-512-maskable.png', 
      'brasilit-icon-192.svg', 
      'brasilit-icon-512.svg',
      'favicon.ico',
      'robots.txt',
      'apple-touch-icon.png'
    ],
    manifest: {
      name: 'Brasilit Vistorias Técnicas',
      short_name: 'Brasilit',
      description: 'Sistema de Vistorias Técnicas da Brasilit - Saint-Gobain',
      theme_color: '#EE1B24',
      background_color: '#ffffff',
      display: 'standalone' as const,
      start_url: '/?source=pwa',
      scope: '/',
      orientation: 'portrait' as const,
      prefer_related_applications: false,
      icons: [
        {
          src: 'brasilit-icon-192-maskable.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable any' as const,
        },
        {
          src: 'brasilit-icon-512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable any' as const,
        },
        {
          src: 'brasilit-icon-192.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any' as const,
        },
        {
          src: 'brasilit-icon-512.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any' as const,
        },
      ],
      shortcuts: [
        {
          name: 'Nova Vistoria',
          short_name: 'Nova Vistoria',
          description: 'Criar uma nova vistoria técnica',
          url: '/inspections/new',
          icons: [{ src: '/shortcut-inspection.svg', sizes: '192x192' }]
        },
        {
          name: 'Dashboard',
          short_name: 'Dashboard',
          description: 'Acessar o painel de controle',
          url: '/dashboard',
          icons: [{ src: '/shortcut-dashboard.svg', sizes: '192x192' }]
        },
        {
          name: 'Lista de Vistorias',
          short_name: 'Vistorias',
          description: 'Visualizar todas as vistorias',
          url: '/inspections',
          icons: [{ src: '/shortcut-list.svg', sizes: '192x192' }]
        }
      ]
    },
    workbox: {
      sourcemap: !isProduction,
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst' as const,
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst' as const,
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /\/api\/.*\/.*/,
          handler: 'NetworkFirst' as const,
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 1 semana
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /\/.*/,
          handler: 'NetworkFirst' as const,
          options: {
            cacheName: 'pages-cache',
            networkTimeoutSeconds: 3,
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 1 semana
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: isProduction,
      type: 'module' as const,
      navigateFallback: 'index.html',
      suppressWarnings: true,
    },
    injectManifest: {
      swSrc: path.resolve(__dirname, 'client/src/service-worker.js'),
      swDest: path.resolve(__dirname, 'dist/sw.js'),
      globDirectory: 'dist',
      globPatterns: [
        '**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,json}'
      ],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
    },
  };

  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      themePlugin(),
      VitePWA(pwaOptions),
      require('tailwindcss')({
        content: [
          './client/src/**/*.{js,jsx,ts,tsx}',
          './client/public/index.html'
        ]
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/src"),
        "@shared": path.resolve(__dirname, "shared"),
      },
    },
    root: path.resolve(__dirname, "client"),
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
          secure: false,
          ws: true
        }
      },
      hmr: {
        overlay: true
      },
      watch: {
        usePolling: true
      },
      host: true,
      strictPort: true
    },
    preview: {
      port: 3000
    },
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
      sourcemap: isProduction ? 'hidden' : true,
      minify: isProduction ? 'terser' : 'esbuild',
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'client/index.html'),
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      esbuildOptions: {
        target: 'es2020',
      },
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
  };
});
