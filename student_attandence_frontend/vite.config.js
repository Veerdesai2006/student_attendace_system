import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy API requests to Flask backend during development
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  // ExcelJS uses Node.js built-ins that must be stubbed for browser builds
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    global: 'globalThis',
  },
  optimizeDeps: {
    // Pre-bundle exceljs so Vite resolves its dependencies correctly
    include: ['exceljs'],
  },
  build: {
    rollupOptions: {
      // Ensure Node.js modules used by exceljs are stubbed
      external: [],
    },
  },
})
