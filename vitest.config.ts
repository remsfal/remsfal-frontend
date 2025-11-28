import { fileURLToPath, URL } from 'node:url';
import {mergeConfig, defineConfig, configDefaults} from 'vitest/config';
import viteConfig from './vite.config';
import { resolve } from 'node:path';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      maxWorkers: '50%',
      coverage: {
        provider: 'istanbul',
        reporter: ['json', 'text'],
        reportsDirectory: '.nyc_output/vitest',
        include: ['src/**/*.ts', 'src/**/*.vue'],
        exclude: [
          ...(configDefaults.coverage?.exclude || []),
          'scripts/**',
          'public/**',
          'dist/**',
          'src/assets/**',
          'src/services/api/*-schema.ts',
        ],
      },
      environment: 'jsdom',
      globals: true,
      mockReset: true,
      restoreMocks: true,
      clearMocks: true,
      exclude: [...configDefaults.exclude, 'e2e/*'],
      setupFiles: [
        resolve(__dirname, 'test/setup/jsdom-fix.ts'),
        resolve(__dirname, 'test/setup/vitest.setup.ts'),
      ],
      root: fileURLToPath(new URL('./', import.meta.url)),
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true,
        },
      },
    },
  }),
);
