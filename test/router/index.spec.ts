// tests/router.spec.ts
import { describe, it, expect } from 'vitest'
import router from '@/router/index'

describe('Router', () => {
  it('should have a /tenancy route', () => {
    const route = router.getRoutes().find(r => r.path === '/tenancy')
    expect(route).toBeTruthy()
    expect(route?.name).toBe('TenancyView')
  })
})
