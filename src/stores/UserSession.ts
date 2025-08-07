import { defineStore } from 'pinia';
import { typedRequest } from '@/services/api/typedRequest';
import type { ResponseType } from '@/services/api/typedRequest';

export type User = ResponseType<'/api/v1/user', 'get'>;

export const useUserSessionStore = defineStore('user-session', {
  state: () => ({
    user: null as User | null,
  }),

  actions: {
    async refreshSessionState() {
      try {
        const user = await typedRequest('get', '/api/v1/user');
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
