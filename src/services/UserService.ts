import { apiClient, type ApiComponents, type ApiPaths } from '@/services/ApiClient.ts';

export type User = ApiComponents['schemas']['UserJson'];
export type AddressInfo = ApiComponents['schemas']['AddressJson'];
export type UserUpdateRequest = ApiPaths['/api/v1/user']['patch']['requestBody']['content']['application/json'];

export default class UserService {
  // Get current user data
  async getUser(): Promise<User> {
    return apiClient.get('/api/v1/user');
  }

  // Update user
  async updateUser(updatedUser: UserUpdateRequest): Promise<User> {
    return apiClient.patch('/api/v1/user', updatedUser);
  }

  // Delete user
  async deleteUser(): Promise<void> {
    await apiClient.delete('/api/v1/user');
    console.log('DELETE user');
  }
}

export const userService = new UserService();
