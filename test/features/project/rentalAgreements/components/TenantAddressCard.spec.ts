import { describe, test, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import TenantAddressCard from '@/features/project/rentalAgreements/components/TenantAddressCard.vue';

const API_BASE = '/api/v1';

const mockTenant = {
  id: 'tenant-1',
  firstName: 'Max',
  lastName: 'Mustermann',
  address: {
    street: 'Musterstraße 1',
    zip: '12345',
    city: 'Berlin',
    province: 'Berlin',
    countryCode: 'DE',
  },
};

describe('TenantAddressCard', () => {
  const mountCard = () =>
    mount(TenantAddressCard, { props: { projectId: 'project-1', tenantId: 'tenant-1' } });

  test('loads the tenant address on mount', async () => {
    server.use(
      http.get(`${API_BASE}/projects/:projectId/tenants/:tenantId`, () =>
        HttpResponse.json(mockTenant),
      ),
    );

    const wrapper = mountCard();
    await flushPromises();

    expect((wrapper.find('input[name="street"]').element as HTMLInputElement).value).toBe(
      'Musterstraße 1',
    );
  });

  test('handles a missing address gracefully', async () => {
    server.use(
      http.get(`${API_BASE}/projects/:projectId/tenants/:tenantId`, () =>
        HttpResponse.json({
          id: 'tenant-1', firstName: 'Max', lastName: 'Mustermann' 
        }),
      ),
    );

    const wrapper = mountCard();
    await flushPromises();

    expect((wrapper.find('input[name="street"]').element as HTMLInputElement).value).toBe('');
  });

  test('saves the updated address and preserves the previously loaded tenant fields', async () => {
    server.use(
      http.get(`${API_BASE}/projects/:projectId/tenants/:tenantId`, () =>
        HttpResponse.json(mockTenant),
      ),
    );

    let receivedBody: Record<string, unknown> | undefined;
    server.use(
      http.patch(`${API_BASE}/projects/:projectId/tenants/:tenantId`, async ({ request }) => {
        receivedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ...mockTenant, ...receivedBody });
      }),
    );

    const wrapper = mountCard();
    await flushPromises();

    await wrapper.find('input[name="street"]').setValue('Neue Straße 2');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(receivedBody?.address).toMatchObject({ street: 'Neue Straße 2' });
    expect(receivedBody).toMatchObject({ firstName: 'Max', lastName: 'Mustermann' });
  });
});
