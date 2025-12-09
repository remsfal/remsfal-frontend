import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserSessionStore } from '@/stores/UserSession';
import { shouldShowDevLogin } from '@/helper/platform';

export function useTopbarUserActions(): {
    t: any;
    sessionStore: any; // Using any to avoid complex type export issues for now, or use ReturnType<typeof useUserSessionStore>
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
        window.location.pathname = '/api/v1/authentication/logout';
    };

    const login = (route: string) => {
        window.location.href = `/api/v1/authentication/login?route=${encodeURIComponent(route)}`;
    };

    const loginDev = async () => {
        const success = await sessionStore.loginDev();
        if (success) {
            router.push('/projects');
        }
    };

    const showDevLoginButton = computed(() => {
        const show = sessionStore.user == null && shouldShowDevLogin();
        return show;
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
