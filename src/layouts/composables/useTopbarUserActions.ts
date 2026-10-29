import {useRoute, useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {useUserSessionStore} from '@/stores/UserSession';
import {clearUserClientData} from '@/helper/clientDataCleanup';
import {unregisterPush} from '@/services/PushSubscriptionService';

export function useTopbarUserActions(): {
    t: ReturnType<typeof useI18n>['t'];
    sessionStore: ReturnType<typeof useUserSessionStore>;
    onAccountSettingsClick: () => void;
    logout: () => Promise<void>;
    login: () => void;
    } {
  const router = useRouter();
  const route = useRoute();
  const { t } = useI18n();
  const sessionStore = useUserSessionStore();

  const onAccountSettingsClick = () => {
    if (route.path.startsWith('/contractor')) {
      router.push('/contractor/account-data');
    } else if (route.path.startsWith('/tenant')) {
      router.push('/tenant/account-data');
    } else {
      router.push('/manager/account-data');
    }
  };

  const logout = async () => {
    await Promise.race([unregisterPush(), new Promise((resolve) => setTimeout(resolve, 2000))]);
    await clearUserClientData();
    globalThis.location.pathname = '/api/v1/authentication/logout';
  };

  const login = () => {
    const redirect = route.query.redirect as string | undefined;
    const target = redirect || route.fullPath;
    router.push({ name: 'Login', query: { redirect: target !== '/' ? target : undefined } });
  };

  return {
    t,
    sessionStore,
    onAccountSettingsClick,
    logout,
    login,
  };
}
