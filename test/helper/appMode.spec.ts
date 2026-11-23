import { describe, it, expect, vi, afterEach } from 'vitest'
import { getAppMode, isAppClosed, loadAppMode, setAppMode } from '@/helper/appMode'

function mockConfigResponse(body: unknown, ok = true) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  } as Response)
}

describe('helper/appMode', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    setAppMode('DEVELOPMENT')
  })

  it('always uses DEVELOPMENT on the dev server without loading the runtime config', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    expect(await loadAppMode()).toBe('DEVELOPMENT')
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(isAppClosed()).toBe(false)
  })

  describe('in a built bundle', () => {
    it.each(['CONSTRUCTION', 'MAINTENANCE', 'PRODUCTION'] as const)('reads %s from /app-config.json', async (mode) => {
      vi.stubEnv('DEV', false)
      const fetchSpy = mockConfigResponse({ mode })
      expect(await loadAppMode()).toBe(mode)
      expect(getAppMode()).toBe(mode)
      expect(fetchSpy).toHaveBeenCalledWith('/app-config.json', { cache: 'no-store' })
    })

    it.each([
      ['an unknown mode', { mode: 'DEVELOPMENT' }],
      ['an unsubstituted placeholder', { mode: '${REMSFAL_APP_MODE}' }],
      ['a config without mode', {}],
    ])('falls back to PRODUCTION for %s', async (_label, body) => {
      vi.stubEnv('DEV', false)
      mockConfigResponse(body)
      expect(await loadAppMode()).toBe('PRODUCTION')
    })

    it('falls back to PRODUCTION when the config is missing', async () => {
      vi.stubEnv('DEV', false)
      mockConfigResponse(null, false)
      expect(await loadAppMode()).toBe('PRODUCTION')
    })

    it('falls back to PRODUCTION when the config is no JSON (SPA fallback to index.html)', async () => {
      vi.stubEnv('DEV', false)
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new SyntaxError('Unexpected token <')),
      } as Response)
      expect(await loadAppMode()).toBe('PRODUCTION')
    })

    it('falls back to PRODUCTION when the request fails', async () => {
      vi.stubEnv('DEV', false)
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
      expect(await loadAppMode()).toBe('PRODUCTION')
    })
  })

  it.each([
    ['DEVELOPMENT', false],
    ['CONSTRUCTION', true],
    ['MAINTENANCE', true],
    ['PRODUCTION', false],
  ] as const)('isAppClosed() is %s → %s', (mode, closed) => {
    setAppMode(mode)
    expect(isAppClosed()).toBe(closed)
  })
})
