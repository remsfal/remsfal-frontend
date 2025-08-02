import { typedRequest } from '../../src/services/api/typedRequest';
import type { ResponseType } from '../../src/services/api/typedRequest';

// Fallback interface for address
export interface AddressFallback {
  street: string;
  city: string;
  province: string;
  zip: string;
  countryCode: string;
}

// Fallback interface for user with all needed fields
export interface UserFallback {
  id: string;
  name?: string;
  email: string;
  firstName: string;
  lastName: string;
  address: AddressFallback;
  mobilePhoneNumber: string;
  businessPhoneNumber: string;
  privatePhoneNumber: string;
  registeredDate: string;
  lastLoginDate: string;
}

// Use the typed response if available, fallback to manual interface
export type User = [ResponseType<'/api/v1/user', 'get'>] extends [unknown]
  ? UserFallback
  : ResponseType<'/api/v1/user', 'get'>;

export type Address = [ResponseType<'/api/v1/address', 'get'>] extends [unknown]
  ? AddressFallback
  : ResponseType<'/api/v1/address', 'get'>;

const USER_ENDPOINT = '/api/v1/user' as const;
const ADDRESS_ENDPOINT = '/api/v1/address' as const;

type AddressRaw = {
  street?: string;
  city?: string;
  state?: string;
  province?: string;
  zip?: string;
  countryCode?: string;
}[];

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
  async getUser(): Promise<User | null> {
    try {
      // Cast the response to User explicitly
      const user = (await typedRequest('get', USER_ENDPOINT, {})) as User;
      console.log('GET user:', user);
      return user;
    } catch (error) {
      console.error('GET user failed:', error);
      return null;
    }
  }

  async getCityFromZip(zip: string): Promise<AddressFallback[] | null> {
    try {
      // Cast the response to Address[] explicitly
      const cityRaw = (await typedRequest('get', ADDRESS_ENDPOINT, {
        params: { query: { zip } },
      })) as Address[];
      const cityNormalized = cityRaw.map(normalizeAddress);
      return cityNormalized.length > 0 ? cityNormalized : null;
    } catch (error) {
      console.error('GET city failed:', error);
      return null;
    }
  }

  async updateUser(updatedUser: Partial<User>): Promise<User | null> {
    try {
      // Cast the response to User explicitly
      const user = (await typedRequest('patch', USER_ENDPOINT, {
        body: updatedUser,
      })) as User;
      console.log('PATCH user:', user);
      return user;
    } catch (error) {
      console.error('PATCH user failed:', error);
      return null;
    }
  }

  async deleteUser(): Promise<boolean> {
    try {
      await typedRequest('delete', USER_ENDPOINT, {});
      console.log('DELETE user');
      return true;
    } catch (error) {
      console.error('DELETE user failed:', error);
      return false;
    }
  }
}
