import { defineStore } from 'pinia';
import { typedRequest } from '@/services/api/typedRequest';
import type { ResponseType } from '@/services/api/typedRequest';

// Fallback type if OpenAPI type is missing or unknown
export interface UserFallback {
  id: string;
  email: string;
}

// Use OpenAPI type if available, otherwise fallback
export type User = [ResponseType<'/api/v1/user', 'get'>] extends [unknown]
  ? UserFallback
  : ResponseType<'/api/v1/user', 'get'>;

export const useUserSessionStore = defineStore('user-session', {
  state: () => ({
    user: null as User | null,
  }),

  actions: {
    async refreshSessionState() {
      try {
        const user = await typedRequest('get', '/api/v1/user', {}) as User;
        this.user = user;
        console.log('Active user session:', user);
      } catch (error: any) {
        console.log('Invalid user session:', error);
        if (error?.response?.status === 401) {
          this.user = null;
        }
      }
    },
  },
});
