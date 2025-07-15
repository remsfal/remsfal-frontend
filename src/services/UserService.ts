import { typedRequest } from '../../src/services/api/typedRequest';
import type { User, Address, AddressFallback } from '@/types/user';

function normalizeAddress(addr: Partial<AddressFallback>): AddressFallback {
  return {
    street: addr.street ?? '',
    city: addr.city ?? '',
    province: addr.province ?? '',
    zip: addr.zip ?? '',
    countryCode: addr.countryCode ?? '',
  };
}

export default class UserService {
  private readonly url = '/api/v1/user';

  async getUser(): Promise<User | null> {
    try {
      const user = await typedRequest('get', this.url, {});
      console.log('GET user:', user);
      return user as User;
    } catch (error) {
      console.error('GET user failed:', error);
      return null;
    }
  }

  async getCityFromZip(zip: string): Promise<Address[] | null> {
    try {
      // Keep nested query param structure
      const cityRaw = await typedRequest('get', '/api/v1/address', {
        params: { query: { zip } },
      });
  
      const cityNormalized = (cityRaw as Partial<AddressFallback>[]).map(normalizeAddress);
  
      return cityNormalized.length > 0 ? cityNormalized : null;
    } catch (error) {
      console.error('GET city failed:', error);
      return null;
    }
  }
  

  async updateUser(updatedUser: Partial<User>): Promise<User | null> {
    try {
      const user = await typedRequest('patch', this.url, { body: updatedUser });
      console.log('PATCH user:', user);
      return user as User;
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
