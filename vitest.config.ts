import { fileURLToPath } from 'node:url';
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
      exclude: [...configDefaults.exclude, 'e2e/*'],
      setupFiles: [resolve(__dirname, 'test/setup/setup.ts')],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
);
