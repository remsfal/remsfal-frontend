import { defineStore } from 'pinia';
import { apiClient, type ApiComponents } from '@/services/ApiClient';
import i18n from '@/i18n/i18n';

export type User = ApiComponents['schemas']['UserJson'];

export const useUserSessionStore = defineStore('user-session', {
  state: () => ({ user: null as User | null, }),

  actions: {
    async refreshSessionState() {
      try {
        const user = await apiClient.get('/api/v1/user');
        this.user = user;
        console.log('Active user session:', user);
        if (user?.locale) {
          i18n.global.locale.value = user.locale;
        }
      } catch (error: unknown) {
        console.log('Invalid user session:', error);
        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          (error as { response?: { status: number } }).response?.status === 401
        ) {
          this.user = null;
        }
      }
    },

    async loginDev(): Promise<boolean> {
      const params = new URLSearchParams();
      params.append('app_id', 'dev');
      params.append('app_token', 'dev');
      params.append('dev_services', 'true');

      try {
        const response = await fetch('/api/v1/authentication/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          credentials: 'include',
          body: params,
        });

        if (response.ok) {
          console.log('Dev Login successful!');
          await this.refreshSessionState();
          return true;
        } else {
          console.error('Dev Login failed:', response.status, response.statusText);
          return false;
        }
      } catch (error) {
        console.error('Dev Login error:', error);
        return false;
      }
    },

    async loginWithToken(token: string) {
      const params = new URLSearchParams();
      params.append('token', token);

      try {
        const response = await fetch('/api/v1/authentication/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          credentials: 'include',
          body: params,
        });

        if (!response.ok) {
          throw new Error(`Token login failed with status ${response.status}`);
        }

        await this.refreshSessionState();
      } catch (error: unknown) {
        console.error('Token-based login failed:', error);
        throw error;
      }
    },
  },
});
