import { fileURLToPath, URL } from 'node:url';
import {mergeConfig, defineConfig, configDefaults} from 'vitest/config';
import viteConfig from './vite.config.ts';
import { resolve } from 'node:path';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      maxWorkers: '50%',
      pool: 'forks',
      logHeapUsage: true,
      // Hide console output (console.error/warn/log from tested code) for passing
      // tests to keep the run readable; failing tests still show their output.
      silent: 'passed-only',
      coverage: {
        provider: 'istanbul',
        reporter: ['json', 'text', 'html', 'lcov'],
        reportsDirectory: 'coverage-vitest',
        include: ['src/**/*.ts', 'src/**/*.vue'],
        exclude: [
          ...(configDefaults.coverage?.exclude || []),
          'scripts/**',
          'public/**',
          'dist/**',
          'src/assets/**',
          'src/services/api/*-schema.ts',
        ],
        thresholds: {
          'src/services/**': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
          },
        },
      },
      environment: 'jsdom',
      globals: true,
      mockReset: true,
      restoreMocks: true,
      clearMocks: true,
      exclude: [...configDefaults.exclude, 'e2e/*', '.claude/**'],
      setupFiles: [
        resolve(import.meta.dirname, 'test/setup/jsdom-fix.ts'),
        resolve(import.meta.dirname, 'test/setup/vitest.setup.ts'),
      ],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
);
