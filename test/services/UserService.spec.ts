import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../../test/mocks/handlers'; 
import UserService from '../../src/services/UserService';

const server = setupServer(...handlers);

describe('UserService with MSW', () => {
  const userService = new UserService();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

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
    expect(city).toEqual([
      {
        city: 'Sample City',
        countryCode: '',
        province: '',
        street: '',
        zip: '12345',
      },
    ]);
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
  

  test('deleteUser returns true on success', async () => {
    const result = await userService.deleteUser();
    expect(result).toBe(true);
  });
});
