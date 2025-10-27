import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import istanbul from 'vite-plugin-istanbul';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import Components from 'unplugin-vue-components/vite';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {noDiscovery: true,},
  plugins: [
    vue(),
    vueDevTools(),
    Components({resolvers: [PrimeVueResolver()],}),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'cypress/', 'test/'],
      extension: ['.ts', '.vue'],
      cypress: true,
      requireEnv: false,
    }),
  ],
  resolve: {alias: {'@': fileURLToPath(new URL('./src', import.meta.url)),},},
  server: {
    // https://vitejs.dev/config/server-options.html
    strictPort: true,
    proxy: {
      // backend proxy: http://localhost:5173/api -> http://localhost:8080/api
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        xfwd: true,
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Proxy Error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Proxy Request to Backend:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Proxy Response from Backend:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});
