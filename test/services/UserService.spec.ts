import { describe, test, expect } from 'vitest';
import UserService from '../../src/services/UserService';

describe('UserService with MSW', () => {
  const userService = new UserService();

  test('getUser returns user data', async () => {
    const user = await userService.getUser();
    expect(user).toEqual({
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  test('getCityFromZip returns addresses for valid zip', async () => {
    const city = await userService.getCityFromZip('12345');
    expect(city).toEqual({
      city: 'Sample City',
      countryCode: '',
      province: '',
      street: '',
      zip: '12345',
    });
  });
  
  test('updateUser returns updated user', async () => {
    const updatedUser = await userService.updateUser({ 
      // cast to `any` to bypass TS check
      ...( { name: 'Jane' } as any )
    });
    expect(updatedUser).toMatchObject({
      id: 'user-123',
      name: 'Jane',
    });
  });
  

  test('deleteUser succeeds', async () => {
    await userService.deleteUser();
    // If no error is thrown, the delete was successful
  });

  test('getCityFromZip returns empty object when no addresses found', async () => {
    const city = await userService.getCityFromZip('00000');
    expect(city).toEqual({});
  });
});
