/**
 * Operating mode of the frontend.
 *
 * - DEVELOPMENT: Vite dev server (`npm run dev`), always — never read from the runtime config.
 * - CONSTRUCTION: Platform not yet released; only a placeholder page and pages flagged with
 *   `meta.availableWhenClosed` (e.g. legal texts) are reachable.
 * - MAINTENANCE: Like CONSTRUCTION, but with a maintenance notice.
 * - PRODUCTION: The full application.
 *
 * Built bundles read the mode at runtime from `/app-config.json`, which the nginx container
 * renders from the environment variable `REMSFAL_APP_MODE` (see runtimeConfig.ts).
 * The same image can therefore be switched between modes without a rebuild.
 */
import { getRuntimeValue, loadRuntimeConfig } from '@/helper/runtimeConfig'

export type AppMode = 'DEVELOPMENT' | 'CONSTRUCTION' | 'MAINTENANCE' | 'PRODUCTION'

const RUNTIME_MODES: readonly AppMode[] = ['CONSTRUCTION', 'MAINTENANCE', 'PRODUCTION']

let currentMode: AppMode = import.meta.env.DEV ? 'DEVELOPMENT' : 'PRODUCTION'

function isRuntimeMode(value: unknown): value is AppMode {
  return typeof value === 'string' && (RUNTIME_MODES as readonly string[]).includes(value)
}

/**
 * Loads the runtime config and resolves the mode once at startup, before the app is mounted.
 * Falls back to PRODUCTION whenever no valid runtime config is available (e.g. native apps,
 * `vite preview`, or an image started without `REMSFAL_APP_MODE`), so existing deployments keep
 * working unchanged.
 */
export async function loadAppMode(): Promise<AppMode> {
  if (import.meta.env.DEV) {
    currentMode = 'DEVELOPMENT'
    return currentMode
  }
  await loadRuntimeConfig()
  const mode = getRuntimeValue('mode')
  currentMode = isRuntimeMode(mode) ? mode : 'PRODUCTION'
  return currentMode
}

export function getAppMode(): AppMode {
  return currentMode
}

/** Only for tests: forces a mode without loading the runtime config. */
export function setAppMode(mode: AppMode): void {
  currentMode = mode
}

/** True when the platform is closed to users (CONSTRUCTION or MAINTENANCE). */
export function isAppClosed(): boolean {
  return currentMode === 'CONSTRUCTION' || currentMode === 'MAINTENANCE'
}
