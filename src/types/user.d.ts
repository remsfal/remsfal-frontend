// src/types/user.d.ts

import type { ResponseType } from '@/services/api/typedRequest';

export interface AddressFallback {
  street: string;
  city: string;
  province: string;
  zip: string;
  countryCode: string;
}

export interface UserFallback {
  id: string;
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

export type User = [ResponseType<'/api/v1/user', 'get'>] extends [unknown]
  ? UserFallback
  : ResponseType<'/api/v1/user', 'get'>;

  export type Address = [ResponseType<'/api/v1/address', 'get'>] extends [unknown]
  ? AddressFallback
  : ResponseType<'/api/v1/address', 'get'>;
