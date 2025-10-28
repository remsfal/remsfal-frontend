import { typedRequest } from '../../src/services/api/typedRequest';
import type { paths } from '../../src/services/api/platform-schema'; // generated OpenAPI types

export default class UserService {
  private static readonly USER_ENDPOINT = '/api/v1/user' as const;
  private static readonly ADDRESS_ENDPOINT = '/api/v1/address' as const;

  // Get current user data, typed from OpenAPI
  async getUser() {
    return typedRequest<typeof UserService.USER_ENDPOINT, 'get'>(
      'get',
      UserService.USER_ENDPOINT
    );
  }

  // Get city info from zip code, typed from OpenAPI
  getCityFromZip(zip: string) {
    return typedRequest<typeof UserService.ADDRESS_ENDPOINT, 'get'>(
      'get',
      UserService.ADDRESS_ENDPOINT,
      {params: {query: { zip },},}
    );
  }

  // Update user with schema-driven request body
  async updateUser(
    updatedUser: paths['/api/v1/user']['patch']['requestBody']['content']['application/json']
  ) {
    return typedRequest<typeof UserService.USER_ENDPOINT, 'patch'>(
      'patch',
      UserService.USER_ENDPOINT,
      {body: updatedUser,}
    );
  }

  // Delete user, returns boolean success
  async deleteUser() {
    try {
      await typedRequest<typeof UserService.USER_ENDPOINT, 'delete'>(
        'delete',
        UserService.USER_ENDPOINT
      );
      console.log('DELETE user');
      return true;
    } catch (error) {
      console.error('DELETE user failed:', error);
      return false;
    }
  }
}
