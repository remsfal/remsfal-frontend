import { computed, type ComputedRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserSessionStore } from '@/stores/UserSession';
import { shouldShowDevLogin } from '@/helper/platform';
import { safeRedirectPath } from '@/helper/redirectHelper';

export type LoginProvider = 'google' | 'apple';

export function useLogin(): {
  redirectTarget: ComputedRef<string | undefined>;
  loginWith: (provider: LoginProvider) => void;
  loginDev: () => Promise<boolean>;
  showDevLogin: ComputedRef<boolean>;
  } {
  const route = useRoute();
  const router = useRouter();
  const sessionStore = useUserSessionStore();

  const redirectTarget = computed(() => safeRedirectPath(route.query.redirect));

  const loginWith = (provider: LoginProvider) => {
    const target = redirectTarget.value ?? '/';
    globalThis.location.href =
      `/api/v1/authentication/login/${provider}?route=${encodeURIComponent(target)}`;
  };

  const loginDev = async () => {
    const success = await sessionStore.loginDev();
    if (success) {
      await router.replace(redirectTarget.value ?? { name: 'ProjectSelection' });
    }
    return success;
  };

  const showDevLogin = computed(() => shouldShowDevLogin());

  return {
    redirectTarget,
    loginWith,
    loginDev,
    showDevLogin,
  };
}
