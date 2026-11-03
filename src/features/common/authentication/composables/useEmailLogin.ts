import { computed, onScopeDispose, ref, type ComputedRef, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserSessionStore } from '@/stores/UserSession';
import { authService } from '@/services/AuthService';
import { safeRedirectPath } from '@/helper/redirectHelper';

export type EmailLoginStep = 'email' | 'code';

type EmailLoginError = 'invalidEmail' | 'invalidCode' | 'rateLimited' | 'tooManyAttempts' | 'unavailable';

/** Seconds the user has to wait before another code can be requested. */
export const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Passwordless login flow: request a one-time code for an email address, then exchange the code
 * for a session. The code is entered in the app itself (no magic link), so the redirect target
 * of the login page is kept without a round trip through the server.
 */
export function useEmailLogin(): {
  step: Ref<EmailLoginStep>;
  email: Ref<string>;
  loading: Ref<boolean>;
  /** Translated message of an error returned by the server */
  error: ComputedRef<string | null>;
  cooldownSeconds: Ref<number>;
  requestCode: (address: string) => Promise<void>;
  resendCode: () => Promise<void>;
  submitCode: (code: string) => Promise<boolean>;
  changeEmail: () => void;
  } {
  const route = useRoute();
  const router = useRouter();
  const { locale, t } = useI18n();
  const sessionStore = useUserSessionStore();

  const step = ref<EmailLoginStep>('email');
  const email = ref(typeof route.query.email === 'string' ? route.query.email : '');
  const loading = ref(false);
  const errorCode = ref<EmailLoginError | null>(null);
  const cooldownSeconds = ref(0);

  // Translated here so that every key appears literally in t('…') (checked by no-unused-keys).
  // The computed re-evaluates on a locale switch, so the message stays in the current language.
  const error = computed(() => {
    switch (errorCode.value) {
      case 'invalidEmail':
        return t('login.email.errors.invalidEmail');
      case 'invalidCode':
        return t('login.email.errors.invalidCode');
      case 'rateLimited':
        return t('login.email.errors.rateLimited');
      case 'tooManyAttempts':
        return t('login.email.errors.tooManyAttempts');
      case 'unavailable':
        return t('login.email.errors.unavailable');
      default:
        return null;
    }
  });

  let cooldownTimer: ReturnType<typeof setInterval> | undefined;

  const stopCooldown = () => {
    if (cooldownTimer !== undefined) {
      clearInterval(cooldownTimer);
      cooldownTimer = undefined;
    }
  };

  const startCooldown = (seconds: number) => {
    stopCooldown();
    cooldownSeconds.value = seconds;
    cooldownTimer = setInterval(() => {
      cooldownSeconds.value = Math.max(0, cooldownSeconds.value - 1);
      if (cooldownSeconds.value === 0) {
        stopCooldown();
      }
    }, 1000);
  };

  onScopeDispose(stopCooldown);

  const sendCode = async (address: string): Promise<boolean> => {
    loading.value = true;
    errorCode.value = null;
    try {
      const result = await authService.requestEmailLoginCode(address, locale.value);
      switch (result.status) {
        case 'sent':
          startCooldown(RESEND_COOLDOWN_SECONDS);
          return true;
        case 'invalid':
          errorCode.value = 'invalidEmail';
          return false;
        case 'rateLimited':
          errorCode.value = 'rateLimited';
          startCooldown(result.retryAfter ?? RESEND_COOLDOWN_SECONDS);
          return false;
        default:
          errorCode.value = 'unavailable';
          return false;
      }
    } finally {
      loading.value = false;
    }
  };

  const requestCode = async (address: string) => {
    const normalized = address.trim();
    if (await sendCode(normalized)) {
      email.value = normalized;
      step.value = 'code';
    }
  };

  const resendCode = async () => {
    if (cooldownSeconds.value > 0 || loading.value) {
      return;
    }
    await sendCode(email.value);
  };

  const submitCode = async (code: string): Promise<boolean> => {
    if (loading.value) {
      return false;
    }
    loading.value = true;
    errorCode.value = null;
    try {
      const result = await sessionStore.loginWithEmailCode(email.value, code);
      switch (result.status) {
        case 'success':
          await router.replace(safeRedirectPath(route.query.redirect) ?? { name: 'ProjectSelection' });
          return true;
        case 'invalidCode':
        case 'invalid':
          errorCode.value = 'invalidCode';
          return false;
        case 'rateLimited':
          errorCode.value = 'tooManyAttempts';
          return false;
        default:
          errorCode.value = 'unavailable';
          return false;
      }
    } finally {
      loading.value = false;
    }
  };

  const changeEmail = () => {
    errorCode.value = null;
    step.value = 'email';
  };

  return {
    step,
    email,
    loading,
    error,
    cooldownSeconds,
    requestCode,
    resendCode,
    submitCode,
    changeEmail,
  };
}
