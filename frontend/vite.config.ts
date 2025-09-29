import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
      clientPort: 5173
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  assetsInclude: ['**/*.pdf'],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdfjs': ['pdfjs-dist']
        }
      }
    }
  },
  worker: {
    format: 'es'
  }
})
