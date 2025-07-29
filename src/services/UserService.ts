import { typedRequest } from '../../src/services/api/typedRequest';
import type { ResponseType } from '../../src/services/api/typedRequest';

type User = ResponseType<'/api/v1/user', 'get'>;

// Extend AddressRaw to include 'state' since your MSW mock returns it
type AddressRaw = {
  street?: string;
  city?: string;
  state?: string;
  province?: string;
  zip?: string;
  countryCode?: string;
}[];

type AddressFallback = {
  street: string;
  city: string;
  province: string;
  zip: string;
  countryCode: string;
};

function normalizeAddress(addr: Partial<AddressRaw[number]>): AddressFallback {
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

  async getCityFromZip(zip: string): Promise<AddressFallback[] | null> {
    try {
      // Cast the unknown response to the expected type to avoid TS errors
      const cityRaw = (await typedRequest('get', '/api/v1/address', {
        params: { query: { zip } },
      })) as Partial<AddressRaw[number]>[];

      const cityNormalized = cityRaw.map(normalizeAddress);
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
