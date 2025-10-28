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
