import { describe, it, expect, vi, afterEach } from 'vitest'
import { getRuntimeValue, loadRuntimeConfig, setRuntimeConfig } from '@/helper/runtimeConfig'

function mockConfigResponse(body: unknown, ok = true) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  } as Response)
}

describe('helper/runtimeConfig', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    setRuntimeConfig({})
  })

  it('loads all values from /app-config.json without caching', async () => {
    const fetchSpy = mockConfigResponse({
      mode: 'PRODUCTION',
      otelEnabled: 'true',
      otlpEndpoint: '/otlp',
    })
    await loadRuntimeConfig()
    expect(fetchSpy).toHaveBeenCalledWith('/app-config.json', { cache: 'no-store' })
    expect(getRuntimeValue('mode')).toBe('PRODUCTION')
    expect(getRuntimeValue('otelEnabled')).toBe('true')
    expect(getRuntimeValue('otlpEndpoint')).toBe('/otlp')
  })

  it.each([
    ['an unsubstituted placeholder', { otlpEndpoint: '${REMSFAL_OTLP_ENDPOINT}' }],
    ['an empty value', { otlpEndpoint: '' }],
    ['a value that is no string', { otlpEndpoint: 42 }],
    ['a missing key', {}],
  ])('returns undefined for %s', async (_label, body) => {
    mockConfigResponse(body)
    await loadRuntimeConfig()
    expect(getRuntimeValue('otlpEndpoint')).toBeUndefined()
  })

  it.each([
    ['the config is missing', () => mockConfigResponse(null, false)],
    ['the config is an array', () => mockConfigResponse(['PRODUCTION'])],
    ['the config is no JSON', () => vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token <')),
    } as Response)],
    ['the request fails', () => vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))],
  ])('drops previously loaded values when %s', async (_label, mock) => {
    setRuntimeConfig({ mode: 'CONSTRUCTION' })
    mock()
    await loadRuntimeConfig()
    expect(getRuntimeValue('mode')).toBeUndefined()
  })
})
