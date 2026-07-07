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

  test('getEmployments returns list with employees array', async () => {
    const result = await service.getEmployments();
    expect(result.employees).toBeDefined();
    expect(Array.isArray(result.employees)).toBe(true);
    expect(result.employees.length).toBeGreaterThan(0);
  });

  test('getEmployments returns employee with expected fields', async () => {
    const result = await service.getEmployments();
    const emp = result.employees[0]!;
    expect(emp.organizationId).toBe('org-123');
    expect(emp.organizationName).toBe('Test GmbH');
    expect(emp.employeeRole).toBe('OWNER');
    expect(emp.active).toBe(true);
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

  test('getContractorOrganizations returns list with organizations array', async () => {
    const result = await service.getContractorOrganizations();
    expect(result.organizations).toBeDefined();
    expect(Array.isArray(result.organizations)).toBe(true);
    expect(result.organizations.length).toBeGreaterThan(0);
  });

  test('getContractorOrganizations returns org with expected fields', async () => {
    const result = await service.getContractorOrganizations();
    const org = result.organizations[0]!;
    expect(org.id).toBe('org-123');
    expect(org.name).toBe('Test GmbH');
  });

  test('getEmployees returns employee list for an organization', async () => {
    const result = await service.getEmployees('org-123');
    expect(result.employees).toBeDefined();
    expect(Array.isArray(result.employees)).toBe(true);
    expect(result.employees.length).toBeGreaterThan(0);
  });

  test('getEmployees returns employee with expected fields', async () => {
    const result = await service.getEmployees('org-123');
    const emp = result.employees[0]!;
    expect(emp.email).toBe('max@test-gmbh.de');
    expect(emp.employeeRole).toBe('OWNER');
  });

  test('addEmployee resolves with employee data', async () => {
    const member = await service.addEmployee('org-123', {
      email: 'new@test-gmbh.de',
      employeeRole: 'STAFF',
    });
    expect(member).toBeDefined();
    expect(member.id).toBeDefined();
  });

  test('updateEmployeeRole returns updated employee', async () => {
    const updated = await service.updateEmployeeRole('org-123', 'emp-1', 'MANAGER');
    expect(updated).toBeDefined();
  });

  test('removeEmployee resolves without error', async () => {
    await expect(
      service.removeEmployee('org-123', 'emp-1'),
    ).resolves.not.toThrow();
  });
});
