import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type ProxyOptions } from 'vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import istanbul from 'vite-plugin-istanbul';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import Components from 'unplugin-vue-components/vite';
import VueRouter from 'vue-router/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Proxy-Configurations-Factory
function createProxyConfig(target: string, backendName: string): ProxyOptions {
  return {
    target,
    changeOrigin: true,
    secure: false,
    xfwd: true,
    ws: true,
    configure: (proxy) => {
      proxy.on('error', (err) => {
        console.log(`[Proxy Error - ${backendName}]`, err);
      });
      proxy.on('proxyReq', (proxyReq, req) => {
        console.log(`[Proxy Request to ${backendName}]:`, req.method, req.url);
      });
      proxy.on('proxyRes', (proxyRes, req) => {
        console.log(`[Proxy Response from ${backendName}]:`, proxyRes.statusCode, req.url);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {noDiscovery: true,},
  plugins: [
    VueRouter({
      routesFolder: 'src/pages',
      dts: 'src/typed-router.d.ts',
    }),
    vue(),
    // Disable DevTools in test environment to avoid localStorage issues
    process.env.VITEST ? undefined : vueDevTools(),
    Components({resolvers: [PrimeVueResolver()],}),
    // Only use istanbul plugin for Cypress E2E tests, not for Vitest unit tests
    // Vitest sets VITEST=true, so we skip istanbul plugin during unit tests
    process.env.VITEST ? undefined : istanbul({
      include: 'src/**/*',
      exclude: ['node_modules', 'cypress/', 'test/'],
      extension: ['.ts', '.vue'],
      requireEnv: false,
      cypress: true,
    }),
    process.env.VITEST ? undefined : VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: false,
      manifest: {
        name: 'remsfal - Cloud Service for Facility Management',
        short_name: 'remsfal',
        description: 'remsfal - Cloud Service for Facility Management',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1e5f20',
        lang: 'en-US',
        icons: [
          {
            src: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' 
          },
          {
            src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' 
          },
          {
            src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' 
          },
          {
            src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' 
          },
          {
            src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' 
          },
        ],
      },
      injectManifest: {injectionPoint: 'self.__WB_MANIFEST',},
      registerType: 'prompt',
      devOptions: {
        enabled: process.env.VITE_SERVICE_WORKER_ENABLED === 'true',
        type: 'module',
      },
    }),
  ].filter(Boolean),
  resolve: {alias: {'@': fileURLToPath(new URL('./src', import.meta.url)),},},
  build: {
    // Enable source maps for better stack traces
    sourcemap: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-icons',
              test: /@fortawesome/,
              priority: 60,
            },
            {
              name: 'vendor-chart',
              test: /chart\.js|chartjs/,
              priority: 50,
            },
            {
              name: 'vendor-primevue',
              test: /primevue|@primevue/,
              priority: 40,
            },
            {
              name: 'vendor-i18n',
              test: /vue-i18n|@intlify/,
              priority: 30,
            },
            {
              name: 'vendor-vue',
              test: /\/vue\/|vue-router|\/pinia\/|@vue\//,
              priority: 20,
            },
            {
              name: 'vendor',
              test: /node_modules/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  server: {
    // https://vitejs.dev/config/server-options.html
    strictPort: true,
    port: 5173,
    host: '0.0.0.0',
    watch: {
      // Coverage reports (written mid-run by istanbul during `coverage:e2e`) mirror the
      // src/ tree — without this, every report write triggers a full page reload.
      ignored: ['**/coverage/**', '**/coverage-cypress/**', '**/coverage-vitest/**'],
    },
    proxy: {
      '/api': createProxyConfig('http://localhost:8080', 'Platform Microservice'),
      '/ticketing': createProxyConfig('http://localhost:8081', 'Ticketing Microservice'),
    },
  },
});
