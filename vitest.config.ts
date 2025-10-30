import { fileURLToPath, URL } from 'node:url';
import {mergeConfig, defineConfig, configDefaults} from 'vitest/config';
import viteConfig from './vite.config';
import { resolve } from 'node:path';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        reporter: ['lcov', 'text', 'json', 'html'],
        reportsDirectory: 'coverage-vitest',
        include: ['src/**/*.ts', 'src/**/*.vue'],
        exclude: [
          ...(configDefaults.coverage?.exclude || []),
          'scripts/**',
          'public/**',
          'dist/**',
          'src/assets/**',
        ],
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
