import type { App, Plugin } from 'vue';

/** Contract of the optional downstream entry point `src/extensions/main.ts`. */
export interface ExtensionEntry {
  /** Registers downstream plugins (e.g. head management); called once before the app is mounted. */
  install?: (app: App) => void;
}

// Upstream ships no src/extensions/main.ts, so the glob matches nothing there.
const entries = import.meta.glob<ExtensionEntry>('/src/extensions/main.ts', { eager: true });

/** Creates the plugin that installs the given downstream entry points. */
export function createExtensionsPlugin(modules: Record<string, ExtensionEntry>): Plugin {
  return {
    install(app) {
      for (const entry of Object.values(modules)) {
        entry.install?.(app);
      }
    },
  };
}

/**
 * Installs the downstream entry point `src/extensions/main.ts`, if present. Used by main.ts and by the
 * unit test setup, so components of downstream projects find their plugins in tests as well.
 */
export const extensionsPlugin = createExtensionsPlugin(entries);
