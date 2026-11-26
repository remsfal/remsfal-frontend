/**
 * Runtime configuration of built bundles.
 *
 * The nginx container renders `/app-config.json` at start from environment variables
 * (see docker/nginx/templates/), so the same image runs in every environment (e.g. staging and
 * production) without a rebuild. Keys and the variables they come from:
 *
 * - `mode`         REMSFAL_APP_MODE        operating mode, see appMode.ts
 * - `otelEnabled`  REMSFAL_OTEL_ENABLED    `true` turns browser telemetry on, see telemetry/otel.ts
 * - `otlpEndpoint` REMSFAL_OTLP_ENDPOINT   base URL of the OTLP/HTTP endpoint, e.g. `/otlp`
 *
 * The dev server never loads it; it uses the Vite variables from `.env` instead.
 */
const APP_CONFIG_URL = '/app-config.json'

let config: Record<string, unknown> = {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Loads `/app-config.json` once at startup. A missing, invalid or unreachable config (native
 * apps, `vite preview`, older images) results in an empty config, so every value falls back to
 * its default.
 */
export async function loadRuntimeConfig(): Promise<void> {
  try {
    const response = await fetch(APP_CONFIG_URL, { cache: 'no-store' })
    const body: unknown = response.ok ? await response.json() : null
    config = isRecord(body) ? body : {}
  } catch {
    config = {}
  }
}

/**
 * Returns a value of the runtime config, or undefined if it is missing, empty or still the
 * unsubstituted placeholder (an image started without the variable defined).
 */
export function getRuntimeValue(key: string): string | undefined {
  const value = config[key]
  if (typeof value !== 'string' || value === '' || value.startsWith('${')) return undefined
  return value
}

/** Only for tests: replaces the runtime config without loading it. */
export function setRuntimeConfig(values: Record<string, unknown>): void {
  config = { ...values }
}
