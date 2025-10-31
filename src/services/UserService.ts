import { typedRequest } from '../../src/services/api/typedRequest';
import type { paths } from '../../src/services/api/platform-schema'; // generated OpenAPI types

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

  // Get city info from zip code, typed from OpenAPI
  getCityFromZip(zip: string) {
    return typedRequest<typeof UserService.ADDRESS_ENDPOINT, 'get'>(
      'get',
      UserService.ADDRESS_ENDPOINT,
      {params: {query: { zip },},}
    );
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
  async deleteUser() {
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
