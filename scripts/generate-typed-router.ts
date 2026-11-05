// Generates src/typed-router.d.ts without starting Vite, so `vue-tsc` can run on a fresh checkout.
import { createRoutesContext, resolveOptions } from 'vue-router/unplugin';
import { typedRouterOptions } from '../plugins/typed-router-options.ts';

const context = createRoutesContext(resolveOptions(typedRouterOptions));
await context.scanPages(false);
context.writeConfigFiles();
