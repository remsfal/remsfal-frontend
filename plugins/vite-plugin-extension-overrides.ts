import fs from 'node:fs';
import path from 'node:path';
import { normalizePath, type Plugin } from 'vite';

/**
 * File-shadowing for downstream projects.
 *
 * A file at `src/extensions/overrides/<path>` replaces `src/<path>` for every import in the app
 * (aliased, relative, barrel or generated route imports). The original stays reachable via
 * `@upstream/<path>`, so an override can wrap or reuse it.
 *
 * Every override must have an upstream counterpart; otherwise the build fails, because an override
 * whose original was renamed or moved upstream would otherwise silently stop being applied.
 */
export interface ExtensionOverridesOptions {
  /** Absolute path of the application's `src` directory. */
  srcDir: string;
  /** Absolute path of the overrides directory. Defaults to `<srcDir>/extensions/overrides`. */
  overridesDir?: string;
  /**
   * Whether imports are redirected to overrides. Disabled in unit tests so upstream specs keep
   * testing the original files; the orphan check runs regardless.
   */
  shadowing?: boolean;
}

export const UPSTREAM_PREFIX = '@upstream/';

/** Placeholder files that keep empty folders in git; they are never treated as overrides. */
const IGNORED_FILES = new Set(['.gitkeep', 'README.md']);

/** Returns the paths of all override files, relative to `overridesDir` and with forward slashes. */
export function collectOverrides(overridesDir: string): string[] {
  if (!fs.existsSync(overridesDir)) return [];
  return fs
    .readdirSync(overridesDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && !IGNORED_FILES.has(entry.name))
    .map((entry) => normalizePath(path.relative(overridesDir, path.join(entry.parentPath, entry.name))))
    .sort();
}

/** Returns the overrides that have no counterpart in `srcDir`. */
export function findOrphanedOverrides(srcDir: string, overrides: string[]): string[] {
  return overrides.filter((file) => !fs.existsSync(path.join(srcDir, file)));
}

export default function extensionOverrides(options: ExtensionOverridesOptions): Plugin {
  const srcDir = normalizePath(path.resolve(options.srcDir));
  const extensionsDir = `${srcDir}/extensions`;
  const overridesDir = normalizePath(path.resolve(options.overridesDir ?? `${extensionsDir}/overrides`));
  const shadowing = options.shadowing ?? true;
  let overrides = new Set<string>();

  /** Maps a resolved upstream file id to its override, or returns null if there is none. */
  function findOverride(id: string, importer: string | undefined): string | null {
    // Query ids (e.g. `?vue&type=style`) are sub-requests of an already resolved module.
    if (id.includes('?') || id.startsWith('\0')) return null;
    const file = normalizePath(id);
    if (!file.startsWith(`${srcDir}/`) || file.startsWith(`${extensionsDir}/`)) return null;
    const relative = file.slice(srcDir.length + 1);
    if (!overrides.has(relative)) return null;
    const override = `${overridesDir}/${relative}`;
    // An override importing its own original via `@/...` gets the original instead of itself.
    return importer && normalizePath(importer) === override ? null : override;
  }

  return {
    name: 'remsfal:extension-overrides',
    enforce: 'pre',

    buildStart() {
      const files = collectOverrides(overridesDir);
      const orphaned = findOrphanedOverrides(srcDir, files);
      if (orphaned.length > 0) {
        this.error(
          `Extension override(s) without an upstream counterpart in ${srcDir}:\n`
          + orphaned.map((file) => `  - ${file}`).join('\n')
          + '\nThe upstream file was probably renamed or moved. Move the override accordingly, or place new '
          + 'downstream code in src/extensions/features/ instead of src/extensions/overrides/.',
        );
      }
      overrides = new Set(files);
    },

    configureServer(server) {
      if (!shadowing) return;
      // Adding or removing an override changes how already resolved imports map, so restart.
      const onChange = (file: string) => {
        if (normalizePath(file).startsWith(`${overridesDir}/`)) void server.restart();
      };
      server.watcher.add(overridesDir);
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
    },

    async resolveId(source, importer, resolveOptions) {
      if (source.startsWith(UPSTREAM_PREFIX)) {
        const original = `${srcDir}/${source.slice(UPSTREAM_PREFIX.length)}`;
        return this.resolve(original, importer, { ...resolveOptions, skipSelf: true });
      }
      if (!shadowing || overrides.size === 0) return null;

      const resolved = await this.resolve(source, importer, { ...resolveOptions, skipSelf: true });
      if (!resolved || resolved.external) return resolved;
      return findOverride(resolved.id, importer) ?? resolved;
    },
  };
}
