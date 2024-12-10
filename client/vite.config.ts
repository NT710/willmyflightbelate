import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Add base URL for production
  base: '/',
  // Configure dev server
  server: {
    proxy: {
      '/api': {
        target: 'https://willmyflightbelate-api.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
