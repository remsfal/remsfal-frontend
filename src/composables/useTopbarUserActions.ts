import {computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {useUserSessionStore} from '@/stores/UserSession';
import {shouldShowDevLogin} from '@/helper/platform';

export function useTopbarUserActions(): {
    t: ReturnType<typeof useI18n>['t'];
    sessionStore: ReturnType<typeof useUserSessionStore>;
    onAccountSettingsClick: () => void;
    logout: () => void;
    login: () => void;
    loginDev: () => Promise<void>;
    showDevLoginButton: import("vue").ComputedRef<boolean>;
} {
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();
    const sessionStore = useUserSessionStore();

    const onAccountSettingsClick = () => {
      // Redirect users to their role-specific view
        const roles = sessionStore.user?.userContexts || [];
        if (roles.includes('MANAGER')) {
          router.push('/manager/account-settings');
        } else if (roles.includes('CONTRACTOR')) {
          router.push('/contractor/account-settings');
        } else if (roles.includes('TENANT')) {
          router.push('/tenancies/account-settings');
        } else {
          // default to manager view if no specific role is found
          router.push('/manager/account-settings');
        }
    };

    const logout = () => {
        globalThis.location.pathname = '/api/v1/authentication/logout';
    };

    const login = () => {
        const redirect = route.query.redirect as string | undefined;
        const target = redirect || route.fullPath;
        globalThis.location.href = `/api/v1/authentication/login?route=${encodeURIComponent(target)}`;
    };

    const loginDev = async () => {
        const success = await sessionStore.loginDev();
        if (success) {
            router.push('/projects');
        }
    };

    const showDevLoginButton = computed(() => {
        return sessionStore.user == null && shouldShowDevLogin();
    });

    return {
        t,
        sessionStore,
        onAccountSettingsClick,
        logout,
        login,
        loginDev,
        showDevLoginButton,
    };
}
