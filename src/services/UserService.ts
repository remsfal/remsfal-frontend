import { typedRequest } from '../../src/services/api/typedRequest';
import type { ResponseType } from '../../src/services/api/typedRequest';

// Extract User type from OpenAPI paths
type User = ResponseType<'/api/v1/user', 'get'>;

// Extract Address[] type from OpenAPI paths
type AddressArray = ResponseType<'/api/v1/address', 'get'>;

export default class UserService {
  private readonly url = '/api/v1/user';

  async getUser(): Promise<User | null> {
    try {
      const user = await typedRequest('get', this.url, {});
      console.log('GET user:', user);
      return user;
    } catch (error) {
      console.error('GET user failed:', error);
      return null;
    }
  }

  async getCityFromZip(zip: string): Promise<AddressArray | null> {
    try {
      const city = await typedRequest('get', '/api/v1/address', {
        params: { zip } as any, 
      });
      console.log('GET city:', city);
      return city;
    } catch (error) {
      console.error('GET city failed:', error);
      return null;
    }
  }
  

  async updateUser(updatedUser: Partial<User>): Promise<User | null> {
    try {
      const user = await typedRequest('patch', this.url, { body: updatedUser });
      console.log('PATCH user:', user);
      return user;
    } catch (error) {
      console.error('PATCH user failed:', error);
      return null;
    }
  }

  async deleteUser(): Promise<boolean> {
    try {
      await typedRequest('delete', this.url, {});
      console.log('DELETE user');
      return true;
    } catch (error) {
      console.error('DELETE user failed:', error);
      return false;
    }
  }
}
