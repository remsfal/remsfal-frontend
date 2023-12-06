import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // https://vitejs.dev/config/server-options.html
    strictPort: true,
    proxy: {
      // string shorthand: http://localhost:5173/api -> http://localhost:8080/api
      '/api': 'http://localhost:8080'
    }
  }
})
