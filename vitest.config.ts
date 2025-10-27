import { fileURLToPath, URL } from 'node:url';
import {mergeConfig, defineConfig, configDefaults} from 'vitest/config';
import viteConfig from './vite.config';
import { resolve } from 'path';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        reporter: ['lcov', 'text', 'json', 'html'],
        reportsDirectory: 'coverage-vitest',
        exclude: [...(configDefaults.coverage?.exclude || []), 'scripts/**'],
      },
      environment: 'jsdom',
      globals: true,
      mockReset: true,
      restoreMocks: true,
      clearMocks: true,
      exclude: [...configDefaults.exclude, 'e2e/*'],
      setupFiles: [resolve(__dirname, 'test/setup/vitest.setup.ts')],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
);
