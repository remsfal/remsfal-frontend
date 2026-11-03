import type { Options } from 'vue-router/unplugin';

/**
 * Options of the file-based router, shared by `vite.config.ts` and `scripts/generate-typed-router.ts`.
 * `src/typed-router.d.ts` is generated and not versioned: downstream projects add routes in
 * `src/extensions/pages/`, so a versioned file would conflict on every upstream route change.
 */
export const typedRouterOptions = {
  // src/extensions/pages/ holds additional routes of downstream projects
  routesFolder: ['src/pages', 'src/extensions/pages'],
  dts: 'src/typed-router.d.ts',
} satisfies Options;
