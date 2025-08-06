import { typedRequest } from '../../src/services/api/typedRequest';
import type { ResponseType } from '../../src/services/api/typedRequest';

export type User = ResponseType<'/api/v1/user', 'get'>;
export type Address = ResponseType<'/api/v1/address', 'get'>;

const USER_ENDPOINT = '/api/v1/user' as const;
const ADDRESS_ENDPOINT = '/api/v1/address' as const;

export default class UserService {
  async getUser(): Promise<User | null> {
    try {
      const user = await typedRequest('get', USER_ENDPOINT);
      return user;
    } catch (error) {
      console.error('GET user failed:', error);
      return null;
    }
  }

  async getCityFromZip(zip: string): Promise<Address | null> {
    try {
      const addresses = await typedRequest('get', ADDRESS_ENDPOINT, {
        params: { query: { zip } },
      });
      if (Array.isArray(addresses) && addresses.length > 0) {
        return addresses;
      } else {
        return null;
      }
    } catch (error) {
      console.error('GET city failed:', error);
      return null;
    }
  }
  
  
  async updateUser(updatedUser: Partial<User>): Promise<User | null> {
    try {
      const user = await typedRequest('patch', USER_ENDPOINT, { body: updatedUser });
      return user;
    } catch (error) {
      console.error('PATCH user failed:', error);
      return null;
    }
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
