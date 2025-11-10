import { defineStore } from 'pinia';
import { typedRequest } from '@/services/api/typedRequest';
import type { ResponseType } from '@/services/api/typedRequest';

export type User = ResponseType<'/api/v1/user', 'get'>;

export const useUserSessionStore = defineStore('user-session', {
  state: () => ({user: null as User | null,}),

  actions: {
    // NEU: gesamten User (oder null) setzen
    setUser(user: User | null) {
  this.user = user;
},

    // NEU: Felder am bestehenden User mergen (nur die übergebenen Keys)
    updateUser(patch: Partial<User>) {
     if (!this.user) {
    this.user = patch as User;
  } else {
    this.user = { ...this.user, ...patch };
  }
},

    async refreshSessionState() {
      try {
        const user = await typedRequest<'/api/v1/user', 'get'>(
          'get',
          '/api/v1/user'
        );
        this.user = user;
         
        console.log('Active user session:', user);
      } catch (err: unknown) {
        // type-safe narrowing instead of any
        const e = err as { response?: { status?: number } };

         
        console.log('Invalid user session:', err);

        if (e.response?.status === 401) {
          this.user = null;
        }
      }
    },
  },
});