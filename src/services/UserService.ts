import { apiClient, type ApiComponents, type ApiPaths } from '@/services/ApiClient.ts';

export type User = ApiComponents['schemas']['UserJson'];
export type AddressInfo = ApiComponents['schemas']['AddressJson'];
export type UserUpdateRequest = ApiPaths['/api/v1/user']['patch']['requestBody']['content']['application/json'];

export default class UserService {
  // Get current user data
  async getUser(): Promise<User> {
    return apiClient.get('/api/v1/user') as Promise<User>;
  }

  // Get city info from zip code - API returns array, take first element
  async getCityFromZip(zip: string): Promise<AddressInfo> {
    const result = await apiClient.get('/api/v1/address', {
      params: { zip },
    });
    // API returns an array of addresses, we take the first one
    const addresses = Array.isArray(result) ? result : [];
    return (addresses.length > 0 ? addresses[0] : {}) as AddressInfo;
  }

  // Update user
  async updateUser(updatedUser: UserUpdateRequest): Promise<User> {
    return apiClient.patch('/api/v1/user', updatedUser as any) as Promise<User>;
  }

  // Delete user, returns boolean success
  async deleteUser(): Promise<boolean> {
    try {
      await apiClient.delete('/api/v1/user');
      console.log('DELETE user');
      return true;
    } catch (error) {
      console.error('DELETE user failed:', error);
      return false;
    }
  }
}
