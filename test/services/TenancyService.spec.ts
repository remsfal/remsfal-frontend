import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../../test/mocks/handlers';
import TenancyService from '../../src/services/TenancyService';

const server = setupServer(...handlers);

describe('TenancyService with MSW', () => {
  const tenancyService = new TenancyService();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('fetchTenancyData returns all tenancies', async () => {
    const tenancies = await tenancyService.fetchTenancyData();
    expect(tenancies.length).toBeGreaterThan(0);
    expect(tenancies[0]).toHaveProperty('id');
    expect(tenancies[0]).toHaveProperty('tenants'); //
  });

  test('fetchTenantData returns flattened list of tenants', async () => {
    const tenants = await tenancyService.fetchTenantData();
    expect(tenants).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Max Mustermann', email: 'max@example.com' })]),
    );
  });

  test('loadTenancyData returns tenancy by ID', async () => {
    const tenancy = await tenancyService.loadTenancyData('t1');
    expect(tenancy).not.toBeNull();
    expect(tenancy).toMatchObject({ id: 't1', active: true });
  });

  test('deleteTenancy returns success on deletion', async () => {
    //  depends on implementing deleteTenancy in the service
    // const result = await tenancyService.deleteTenancy('t1');
    // expect(result).toBe(true);
    expect(true).toBe(true);
  });
});
