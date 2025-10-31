import { apiClient, type ApiComponents, type ApiPaths } from '@/services/ApiClient.ts';

type UserGetResponse = paths['/api/v1/user']['get']['responses'][200]['content']['application/json'];
type UserPatchRequestBody = paths['/api/v1/user']['patch']['requestBody']['content']['application/json'];

export default class UserService {
  private static readonly USER_ENDPOINT = '/api/v1/user' as const;
  private static readonly ADDRESS_ENDPOINT = '/api/v1/address' as const;

  // Get current user data, typed from OpenAPI
  async getUser(): Promise<UserGetResponse> {
    return typedRequest<typeof UserService.USER_ENDPOINT, 'get'>(
      'get',
      UserService.USER_ENDPOINT
    );
  }

  // Get city info from zip code - API returns array, take first element
  async getCityFromZip(zip: string): Promise<AddressInfo> {
    const result = await apiClient.get('/api/v1/address', {params: { zip },});
    // API returns an array of addresses, we take the first one
    const addresses = Array.isArray(result) ? result : [];
    return (addresses.length > 0 ? addresses[0] : {}) as AddressInfo;
  }

  async updateUser(updatedUser: Partial<UserPatchRequestBody>) {
    await typedRequest<typeof UserService.USER_ENDPOINT, 'patch'>(
      'patch',
      UserService.USER_ENDPOINT,
      { body: updatedUser }
    );

    // Immer den frischen Stand laden (falls Backend 204/boolean/alten Stand liefert)
    return this.getUser();
  }


  // Delete user, returns boolean success
  async deleteUser(): Promise<boolean> {
    try {
      await typedRequest<typeof UserService.USER_ENDPOINT, 'delete'>(
        'delete',
        UserService.USER_ENDPOINT
      );
     
      return true;
    } catch (error) {
      console.error('DELETE user failed:', error);
      return false;
    }
  }
}
