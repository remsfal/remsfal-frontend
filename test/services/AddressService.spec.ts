import { describe, test, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import AddressService from '@/services/AddressService';

describe('AddressService with MSW', () => {
  const addressService = new AddressService();

  test('getCityFromZip returns address data for valid zip', async () => {
    const address = await addressService.getCityFromZip('12345');
    expect(address).toEqual({
      city: 'Sample City',
      countryCode: '',
      province: '',
      street: '',
      zip: '12345',
    });
  });

  test('getCityFromZip returns empty object when no addresses found', async () => {
    const address = await addressService.getCityFromZip('00000');
    expect(address).toEqual({});
  });

  test('getCityFromZip returns empty object when the API responds with a non-array body', async () => {
    server.use(
      http.get('/api/v1/address', () => {
        return HttpResponse.json({ message: 'unexpected shape' });
      }),
    );

    const address = await addressService.getCityFromZip('12345');
    expect(address).toEqual({});
  });
});