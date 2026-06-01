import { describe, test, expect } from 'vitest';
import { OrganizationService } from '@/services/OrganizationService';

describe('OrganizationService with MSW', () => {
  const service = new OrganizationService();

  test('getOrganizations returns list with organizations array', async () => {
    const result = await service.getOrganizations();
    expect(result.organizations).toBeDefined();
    expect(Array.isArray(result.organizations)).toBe(true);
    expect(result.organizations.length).toBeGreaterThan(0);
  });

  test('getOrganizations returns org with expected fields', async () => {
    const result = await service.getOrganizations();
    const org = result.organizations[0]!;
    expect(org.id).toBe('org-123');
    expect(org.name).toBe('Test GmbH');
  });

  test('getEmployments returns list with organizations array', async () => {
    const result = await service.getEmployments();
    expect(result.organizations).toBeDefined();
    expect(Array.isArray(result.organizations)).toBe(true);
  });

  test('createOrganization resolves without error', async () => {
    await expect(
      service.createOrganization({ name: 'Neue GmbH' }),
    ).resolves.not.toThrow();
  });

  test('getOrganization returns org by id', async () => {
    const org = await service.getOrganization('org-123');
    expect(org.id).toBe('org-123');
    expect(org.name).toBeDefined();
  });

  test('updateOrganization merges request body into response', async () => {
    const updated = await service.updateOrganization('org-123', {name: 'Aktualisierte GmbH',});
    expect(updated.name).toBe('Aktualisierte GmbH');
    expect(updated.id).toBe('org-123');
  });

  test('updateOrganization preserves unchanged fields', async () => {
    const updated = await service.updateOrganization('org-123', {phone: '+4930123456',});
    expect(updated.phone).toBe('+4930123456');
    expect(updated.name).toBeDefined();
  });
});
