import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { normalizePath, type Plugin } from 'vite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import extensionOverrides, { collectOverrides, findOrphanedOverrides, type ExtensionOverridesOptions }
  from '../../plugins/vite-plugin-extension-overrides';

type ResolveIdHook = (
  this: unknown, source: string, importer: string | undefined, options: object,
) => Promise<{ id: string; external?: boolean } | string | null>;

let root: string;
let srcDir: string;
let overridesDir: string;

function writeFile(relativePath: string, content = '') {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

/** Simulates the rest of the resolver chain: `@/` alias, absolute and relative paths. */
const resolveMock = vi.fn(async (source: string, importer?: string) => {
  if (source.startsWith('virtual:')) return { id: `\0${source}` };
  if (source === 'external-lib') return { id: source, external: true };
  if (source === 'missing') return null;
  const [file, query] = source.split('?');
  let id: string;
  if (file.startsWith('@/')) id = `${srcDir}/${file.slice(2)}`;
  else if (path.isAbsolute(file)) id = file;
  else id = path.resolve(path.dirname(importer ?? srcDir), file);
  return { id: normalizePath(id) + (query ? `?${query}` : '') };
});

function createPlugin(options: Partial<ExtensionOverridesOptions> = {}) {
  const plugin = extensionOverrides({ srcDir, ...options }) as Plugin;
  const context = {
    resolve: resolveMock,
    error: (message: string) => {
      throw new Error(message);
    },
  };
  return {
    plugin,
    buildStart: () => (plugin.buildStart as (this: unknown) => void).call(context),
    resolveId: (source: string, importer?: string) =>
      (plugin.resolveId as ResolveIdHook).call(context, source, importer, {}),
  };
}

const idOf = (result: Awaited<ReturnType<ResolveIdHook>>) =>
  (typeof result === 'string' ? result : result?.id);

beforeEach(() => {
  root = normalizePath(fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'extension-overrides-'))));
  srcDir = `${root}/src`;
  overridesDir = `${srcDir}/extensions/overrides`;
  writeFile('src/views/LandingPageView.vue');
  writeFile('src/views/OtherView.vue');
  writeFile('src/features/common/landing/index.ts');
  writeFile('src/features/common/landing/components/Hero.vue');
  writeFile('src/extensions/overrides/.gitkeep');
  resolveMock.mockClear();
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('collectOverrides', () => {
  it('returns an empty list if the overrides folder does not exist', () => {
    expect(collectOverrides(`${root}/does-not-exist`)).toEqual([]);
  });

  it('lists nested override files relative to the folder and ignores placeholders', () => {
    writeFile('src/extensions/overrides/views/LandingPageView.vue');
    writeFile('src/extensions/overrides/features/common/landing/components/Hero.vue');
    writeFile('src/extensions/overrides/README.md');

    expect(collectOverrides(overridesDir)).toEqual([
      'features/common/landing/components/Hero.vue',
      'views/LandingPageView.vue',
    ]);
  });
});

describe('findOrphanedOverrides', () => {
  it('returns overrides without an upstream counterpart', () => {
    expect(findOrphanedOverrides(srcDir, ['views/LandingPageView.vue', 'views/Renamed.vue']))
      .toEqual(['views/Renamed.vue']);
  });
});

describe('extensionOverrides plugin', () => {
  it('runs before the other resolvers', () => {
    expect(createPlugin().plugin.enforce).toBe('pre');
  });

  describe('buildStart', () => {
    it('accepts an empty overrides folder', () => {
      expect(() => createPlugin().buildStart()).not.toThrow();
    });

    it('fails for overrides without an upstream counterpart', () => {
      writeFile('src/extensions/overrides/views/LandingPageView.vue');
      writeFile('src/extensions/overrides/views/Renamed.vue');

      expect(() => createPlugin().buildStart()).toThrow(/views\/Renamed\.vue/);
    });

    it('also fails when shadowing is disabled', () => {
      writeFile('src/extensions/overrides/views/Renamed.vue');

      expect(() => createPlugin({ shadowing: false }).buildStart()).toThrow(/Renamed\.vue/);
    });

    it('supports a custom overrides folder', () => {
      writeFile('custom/views/Renamed.vue');

      expect(() => createPlugin({ overridesDir: `${root}/custom` }).buildStart()).toThrow(/Renamed\.vue/);
    });
  });

  describe('resolveId', () => {
    it('does not touch imports when there are no overrides', async () => {
      const { buildStart, resolveId } = createPlugin();
      buildStart();

      await expect(resolveId('@/views/LandingPageView.vue')).resolves.toBeNull();
      expect(resolveMock).not.toHaveBeenCalled();
    });

    describe('with an override', () => {
      const override = () => `${overridesDir}/views/LandingPageView.vue`;
      let plugin: ReturnType<typeof createPlugin>;

      beforeEach(() => {
        writeFile('src/extensions/overrides/views/LandingPageView.vue');
        writeFile('src/extensions/overrides/features/common/landing/components/Hero.vue');
        plugin = createPlugin();
        plugin.buildStart();
      });

      it('redirects aliased imports to the override', async () => {
        expect(idOf(await plugin.resolveId('@/views/LandingPageView.vue', `${srcDir}/pages/index.vue`)))
          .toBe(override());
      });

      it('redirects relative imports, e.g. from a feature barrel', async () => {
        const result = await plugin.resolveId('./components/Hero.vue', `${srcDir}/features/common/landing/index.ts`);
        expect(idOf(result)).toBe(`${overridesDir}/features/common/landing/components/Hero.vue`);
      });

      it('redirects absolute imports, e.g. generated route imports', async () => {
        expect(idOf(await plugin.resolveId(`${srcDir}/views/LandingPageView.vue`))).toBe(override());
      });

      it('applies overrides to imports from extension code', async () => {
        const importer = `${srcDir}/extensions/features/common/legal/ImprintView.vue`;
        expect(idOf(await plugin.resolveId('@/views/LandingPageView.vue', importer))).toBe(override());
      });

      it('keeps files without an override', async () => {
        expect(idOf(await plugin.resolveId('@/views/OtherView.vue'))).toBe(`${srcDir}/views/OtherView.vue`);
      });

      it('does not redirect query sub-requests of the original module', async () => {
        const source = `${srcDir}/views/LandingPageView.vue?vue&type=style&index=0&lang.scss`;
        expect(idOf(await plugin.resolveId(source))).toBe(source);
      });

      it('does not redirect files inside src/extensions', async () => {
        const source = `${overridesDir}/views/LandingPageView.vue`;
        expect(idOf(await plugin.resolveId(source))).toBe(source);
      });

      it('gives an override that imports its own path the original', async () => {
        expect(idOf(await plugin.resolveId('@/views/LandingPageView.vue', override())))
          .toBe(`${srcDir}/views/LandingPageView.vue`);
      });

      it('resolves @upstream/ to the original even if an override exists', async () => {
        expect(idOf(await plugin.resolveId('@upstream/views/LandingPageView.vue', override())))
          .toBe(`${srcDir}/views/LandingPageView.vue`);
      });

      it('passes through virtual, external and unresolved modules', async () => {
        expect(idOf(await plugin.resolveId('virtual:pwa-register'))).toBe('\0virtual:pwa-register');
        await expect(plugin.resolveId('external-lib')).resolves.toEqual({ id: 'external-lib', external: true });
        await expect(plugin.resolveId('missing')).resolves.toBeNull();
      });

      it('resolves files outside src without redirecting them', async () => {
        const source = `${root}/node_modules/lib/index.js`;
        expect(idOf(await plugin.resolveId(source))).toBe(source);
      });
    });

    it('does not redirect when shadowing is disabled, but still resolves @upstream/', async () => {
      writeFile('src/extensions/overrides/views/LandingPageView.vue');
      const { buildStart, resolveId } = createPlugin({ shadowing: false });
      buildStart();

      await expect(resolveId('@/views/LandingPageView.vue')).resolves.toBeNull();
      expect(idOf(await resolveId('@upstream/views/LandingPageView.vue')))
        .toBe(`${srcDir}/views/LandingPageView.vue`);
    });
  });

  describe('configureServer', () => {
    function createServer() {
      const handlers: Record<string, (file: string) => void> = {};
      const server = {
        restart: vi.fn(),
        watcher: {
          add: vi.fn(),
          on: vi.fn((event: string, handler: (file: string) => void) => {
            handlers[event] = handler;
          }),
        },
      };
      return { server, handlers };
    }

    it('restarts the dev server when an override is added or removed', () => {
      const { server, handlers } = createServer();
      (createPlugin().plugin.configureServer as (s: unknown) => void)(server);

      expect(server.watcher.add).toHaveBeenCalledWith(overridesDir);
      handlers.add(`${overridesDir}/views/LandingPageView.vue`);
      handlers.unlink(`${overridesDir}/views/LandingPageView.vue`);
      handlers.add(`${srcDir}/views/NewView.vue`);
      expect(server.restart).toHaveBeenCalledTimes(2);
    });

    it('does not watch overrides when shadowing is disabled', () => {
      const { server } = createServer();
      (createPlugin({ shadowing: false }).plugin.configureServer as (s: unknown) => void)(server);

      expect(server.watcher.add).not.toHaveBeenCalled();
    });
  });
});
