import { apiClient, type ApiComponents, type Readable, type Writable } from '@/services/ApiClient';

export type UserJson = Readable<ApiComponents['schemas']['UserJson']>;
export type AddressJson = Readable<ApiComponents['schemas']['AddressJson']>;
export type UserUpdateRequest = Writable<ApiComponents['schemas']['UserJson']>;

export default class UserService {
  // Get current user data
  async getUser(): Promise<UserJson> {
    return apiClient.get('/api/v1/user');
  }

  // Update user
  async updateUser(updatedUser: UserUpdateRequest): Promise<UserJson> {
    return apiClient.patch('/api/v1/user', updatedUser);
  }

  // Update address
  async updateAddress(updatedAddress: AddressJson): Promise<UserJson> {
    return apiClient.patch('/api/v1/user', { address: updatedAddress });
  }

  // Delete user
  async deleteUser(): Promise<void> {
    await apiClient.delete('/api/v1/user');
  }
}

export const userService = new UserService();
