import { describe, test, expect } from 'vitest';
import { tenantService } from '@/services/TenantService';

const projectId = 'test-project';

describe('TenantService with MSW', () => {
  test('fetchTenants returns list of tenants', async () => {
    const tenants = await tenantService.fetchTenants(projectId);
    expect(tenants).toHaveLength(2);
    expect(tenants[0].firstName).toBe('Max');
  });

  test('fetchTenants falls back to empty array when tenants field is missing', async () => {
    const tenants = await tenantService.fetchTenants('empty-project');
    expect(tenants).toEqual([]);
  });

  test('getTenant returns a single tenant', async () => {
    const tenant = await tenantService.getTenant(projectId, 'tenant-1');
    expect(tenant.id).toBe('tenant-1');
    expect(tenant.firstName).toBe('Max');
  });

  test('getTenant handles non-existing tenant (404)', async () => {
    await expect(tenantService.getTenant(projectId, 'not-found')).rejects.toThrow();
  });

  test('updateTenant returns the updated tenant', async () => {
    const updates = { firstName: 'Updated', lastName: 'Mustermann' };
    const updated = await tenantService.updateTenant(projectId, 'tenant-1', updates);
    expect(updated).toMatchObject({ id: 'tenant-1', ...updates });
  });
});
