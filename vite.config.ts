import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import istanbul from 'vite-plugin-istanbul';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import Components from 'unplugin-vue-components/vite';

// Proxy-Configurations-Factory
function createProxyConfig(target: string, backendName: string) {
  return {
    target,
    changeOrigin: true,
    secure: false,
    xfwd: true,
    ws: true,
    configure: (proxy: any) => {
      proxy.on('error', (err: any) => {
        console.log(`[Proxy Error - ${backendName}]`, err);
      });
      proxy.on('proxyReq', (proxyReq: any, req: any) => {
        console.log(`[Proxy Request to ${backendName}]:`, req.method, req.url);
      });
      proxy.on('proxyRes', (proxyRes: any, req: any) => {
        console.log(`[Proxy Response from ${backendName}]:`, proxyRes.statusCode, req.url);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    noDiscovery: true,
  },
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'cypress/', 'test/'],
      extension: ['.ts', '.vue'],
      cypress: true,
      requireEnv: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // https://vitejs.dev/config/server-options.html
    strictPort: true,
    proxy: {
      '/api': createProxyConfig('http://localhost:8080', 'Platform Microservice'),
      '/ticketing': createProxyConfig('http://localhost:8081', 'Ticketing Microservice'),
    },
  },
});
