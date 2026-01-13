import { defineStore } from 'pinia';
import { apiClient, type ApiComponents } from '@/services/ApiClient';
import i18n from '@/i18n/i18n';

export type User = ApiComponents['schemas']['UserJson'];

export const useUserSessionStore = defineStore('user-session', {
  state: () => ({user: null as User | null,}),

  actions: {
    async refreshSessionState() {
      try {
        const user = await apiClient.get('/api/v1/user');
        this.user = user;
        console.log('Active user session:', user);

        if (user?.locale) {
          i18n.global.locale.value = user.locale;
        }
      } catch (error: any) {
        console.log('Invalid user session:', error);
        if (error?.response?.status === 401) {
          this.user = null;
        }
      }
    },
  },
});
