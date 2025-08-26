import { typedRequest } from '../../src/services/api/typedRequest';

export default class UserService {
  private static readonly USER_ENDPOINT = '/api/v1/user' as const;
  private static readonly ADDRESS_ENDPOINT = '/api/v1/address' as const;

  // Get current user data, typed from OpenAPI
  async getUser() {
    return typedRequest('get', UserService.USER_ENDPOINT);
  }

  // Get city info from zip code, typed from OpenAPI
  getCityFromZip(zip: string) {
    return typedRequest<'/api/v1/address', 'get'>('get', '/api/v1/address', {
      params: {
        query: { zip },
      },
    });
  }

  // Update user with partial data, typed from OpenAPI
  async updateUser(updatedUser: Partial<any>) {
    // If you want to use the exact request body type from OpenAPI,
    // replace `Partial<any>` with proper RequestBody type from OpenAPI
    return typedRequest('patch', UserService.USER_ENDPOINT, {
      body: updatedUser,
    });
  }

  // Delete user, returns boolean success
  async deleteUser() {
    try {
      await typedRequest('delete', UserService.USER_ENDPOINT);
      console.log('DELETE user');
      return true;
    }
    catch (error) {
      console.error('DELETE user failed:', error);
      return false;
    }
  }
}
