import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import UserService, { User, Address } from '../../src/services/UserService';

describe('UserService', () => {
  const service = new UserService();
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    address: {
      street: '123 Test St',
      city: 'Test City',
      province: 'Test Province',
      zip: '12345',
      countryCode: 'US',
    },
    mobilePhoneNumber: '1234567890',
    businessPhoneNumber: '0987654321',
    privatePhoneNumber: '1112223333',
    registeredDate: '2023-01-01T00:00:00Z',
    lastLoginDate: '2024-01-02T00:00:00Z',
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch a user', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: mockUser });
    const user = await service.getUser();
    expect(user).toEqual(mockUser);
  });

  it('should retrieve city from zip code', async () => {
    const mockAddress: Address[] = [
      {
        street: '124 Test St',
        city: 'Test City',
        province: 'Test Province',
        zip: '12345',
        countryCode: 'US',
      },
    ];
    vi.spyOn(axios, 'get').mockResolvedValue({ data: mockAddress });
    const city = await service.getCityFromZip('12345');
    expect(city).toEqual(mockAddress);
  });

  it('should update a user', async () => {
    const updatedUser: Partial<User> = { firstName: 'Jane', lastName: 'Doe' };
    const updatedResponse = { ...mockUser, ...updatedUser };
    vi.spyOn(axios, 'patch').mockResolvedValue({ data: updatedResponse });
    const result = await service.updateUser(updatedUser);
    expect(result?.firstName).toBe('Jane');
    expect(result?.lastName).toBe('Doe');
  });

  it('should delete a user', async () => {
    vi.spyOn(axios, 'delete').mockResolvedValue({});
    const result = await service.deleteUser();
    expect(result).toBe(true);
  });
});
