import { fileURLToPath, URL } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';
import { resolve } from 'path';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        reporter: ['lcov', 'text', 'json', 'html'],
      },
      environment: 'jsdom',
      globals: true,
      mockReset: true,
      restoreMocks: true,
      clearMocks: true,
      exclude: [...configDefaults.exclude, 'e2e/*', 'test/service-worker/**'],
      setupFiles: [resolve(__dirname, 'test/setup/vitest.setup.ts')],
      root: fileURLToPath(new URL('./', import.meta.url)),
      // include: ['src/**/*.test.ts', 'test/**/*.spec.ts'], // optional
    },
  }),
);
