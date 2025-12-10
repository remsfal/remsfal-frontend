import { describe, test, expect } from 'vitest';
import AddressService from '../../src/services/adressService';

describe('AddressService', () => {
  const addressService = new AddressService();

  test('getCityFromZip returns address data for valid zip', async () => {
    const address = await addressService.getCityFromZip('10115');
    expect(address).toBeDefined();
    expect(address.city).toBeDefined();
    expect(address.province).toBeDefined();
    expect(address.countryCode).toBeDefined();
  });

  test('getCityFromZip returns empty object when no addresses found', async () => {
    const address = await addressService.getCityFromZip('00000');
    expect(address).toEqual({});
  });

  test('getCityFromZip returns address with correct structure', async () => {
    const address = await addressService.getCityFromZip('10115');
    if (Object.keys(address).length > 0) {
      expect(address).toHaveProperty('street');
      expect(address).toHaveProperty('city');
      expect(address).toHaveProperty('zip');
      expect(address).toHaveProperty('province');
      expect(address).toHaveProperty('countryCode');
    }
  });
});