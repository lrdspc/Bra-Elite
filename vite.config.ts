import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import themePlugin from '@replit/vite-plugin-shadcn-theme-json';
import path, { dirname } from 'path';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
import { fileURLToPath } from 'url';
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa';
import type { PluginOption } from 'vite'; // Adicionando importação do tipo PluginOption

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do VitePWA
const getPWAOptions = (isProduction: boolean): Partial<VitePWAOptions> => ({
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'service-worker.js',
  registerType: 'autoUpdate',
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
    display: 'standalone',
    start_url: '/?source=pwa',
    scope: '/',
    orientation: 'portrait',
    prefer_related_applications: false,
    icons: [
      {
        src: 'brasilit-icon-192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: 'brasilit-icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any',
      },
    ],
  },
  devOptions: {
    enabled: !isProduction,
    type: 'module',
    navigateFallback: 'index.html',
  },
});

// Configuração base para o Vite
export default defineConfig(({ mode }): UserConfig => {
  const isProduction = mode === 'production';
  const isReplit = process.env.REPL_ID !== undefined;
  
  // Configuração base para o Vite
  const baseConfig: UserConfig = {
    base: '/',
    plugins: [
      react(),
      // Desabilitando temporariamente o PWA para resolver problemas de build
      // VitePWA(getPWAOptions(isProduction)) as PluginOption
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      open: !process.env.CI,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  };
  
  // Configurações específicas para desenvolvimento
  if (!isProduction) {
    const devConfig: UserConfig = {
      ...baseConfig,
      define: {
        'process.env': {}
      },
      server: {
        ...baseConfig.server,
        proxy: {
          '/.netlify/functions': {
            target: 'http://localhost:9999',
            changeOrigin: true,
            secure: false,
            ws: true,
          },
        },
      },
    };
    return devConfig;
  }
  
  // Configurações para produção
  return baseConfig;

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
    base: isProduction ? '/' : '/',
    plugins: [
      react(),
      runtimeErrorOverlay(),
      themePlugin(),
      // Configuração para funcionar com o Netlify Dev
      !isProduction && {
        name: 'configure-server',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            next();
          });
        }
      },
      VitePWA(pwaOptions)
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
