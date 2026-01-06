import { describe, test, expect } from 'vitest';
import AddressService from '../../src/services/adressService';

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
});