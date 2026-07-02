import { describe, test, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import UserAddressCard from '@/features/common/users/components/UserAddressCard.vue';

const API_BASE = '/api/v1';

const mockAddress = {
  street: 'Musterstraße 1',
  zip: '12345',
  city: 'Berlin',
  province: 'Berlin',
  countryCode: 'DE',
};

describe('UserAddressCard', () => {
  test('loads the user address on mount', async () => {
    server.use(
      http.get(`${API_BASE}/user`, () =>
        HttpResponse.json({ id: 'user-123', address: mockAddress }),
      ),
    );

    const wrapper = mount(UserAddressCard);
    await flushPromises();

    expect((wrapper.find('input[name="street"]').element as HTMLInputElement).value).toBe(
      'Musterstraße 1',
    );
  });

  test('handles a missing address gracefully', async () => {
    server.use(http.get(`${API_BASE}/user`, () => HttpResponse.json({ id: 'user-123' })));

    const wrapper = mount(UserAddressCard);
    await flushPromises();

    expect((wrapper.find('input[name="street"]').element as HTMLInputElement).value).toBe('');
  });

  test('saves the updated address via the user patch endpoint', async () => {
    server.use(
      http.get(`${API_BASE}/user`, () =>
        HttpResponse.json({ id: 'user-123', address: mockAddress }),
      ),
    );

    let receivedBody: Record<string, unknown> | undefined;
    server.use(
      http.patch(`${API_BASE}/user`, async ({ request }) => {
        receivedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 'user-123', ...receivedBody });
      }),
    );

    const wrapper = mount(UserAddressCard);
    await flushPromises();

    await wrapper.find('input[name="street"]').setValue('Neue Straße 2');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(receivedBody?.address).toMatchObject({ street: 'Neue Straße 2' });
  });
});
