import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {useUserSessionStore} from '@/stores/UserSession';
import {shouldShowDevLogin} from '@/helper/platform';

export function useTopbarUserActions(): {
    t: ReturnType<typeof useI18n>['t'];
    sessionStore: ReturnType<typeof useUserSessionStore>;
    onAccountSettingsClick: () => void;
    logout: () => void;
    login: (route: string) => void;
    loginDev: () => Promise<void>;
    showDevLoginButton: import("vue").ComputedRef<boolean>;
} {
    const router = useRouter();
    const { t } = useI18n();
    const sessionStore = useUserSessionStore();

    const onAccountSettingsClick = () => {
        router.push('/account-settings');
    };

    const logout = () => {
        globalThis.location.pathname = '/api/v1/authentication/logout';
    };

    const login = (route: string) => {
        globalThis.location.href = `/api/v1/authentication/login?route=${encodeURIComponent(route)}`;
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
