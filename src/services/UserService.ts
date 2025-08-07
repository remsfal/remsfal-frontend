import { typedRequest } from '../../src/services/api/typedRequest';
import type { RequestBody, ResponseType } from '../../src/services/api/typedRequest';

const USER_ENDPOINT = '/api/v1/user' as const;
const ADDRESS_ENDPOINT = '/api/v1/address' as const;

export default class UserService {
  async getUser(): Promise<ResponseType<typeof USER_ENDPOINT, 'get'>> {
    return typedRequest('get', USER_ENDPOINT);
  }

  async getCityFromZip(zip: string): Promise<ResponseType<typeof ADDRESS_ENDPOINT, 'get'> | null> {
    try {
      const addresses = await typedRequest('get', ADDRESS_ENDPOINT, { params: { query: { zip } } });
      return addresses.length > 0 ? addresses : null;
    } catch (error) {
      console.error('GET city failed:', error);
      return null;
    }
  }
  
  async updateUser(
    updatedUser: RequestBody<typeof USER_ENDPOINT, 'patch'>
  ): Promise<ResponseType<typeof USER_ENDPOINT, 'patch'>> {
    return typedRequest('patch', USER_ENDPOINT, { body: updatedUser });
  }

  async deleteUser(): Promise<boolean> {
    try {
      await typedRequest('delete', USER_ENDPOINT);
      return true;
    } catch (error) {
      console.error('DELETE user failed:', error);
      return false;
    }
  }
}
