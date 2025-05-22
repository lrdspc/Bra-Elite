import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  base: './',
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/service-worker.js',
          dest: '.'
        }
      ]
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
})