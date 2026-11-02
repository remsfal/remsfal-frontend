import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n/i18n';
import { useEmailLogin, RESEND_COOLDOWN_SECONDS } from '@/features/common/authentication/composables/useEmailLogin';
import { authService } from '@/services/AuthService';
import { useUserSessionStore } from '@/stores/UserSession';

let currentQuery: Record<string, string> = {};

const mockReplace = vi.fn();
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRouter: () => ({ replace: mockReplace }),
    useRoute: () => ({ get query() { return currentQuery; } }),
  };
});

const TestComponent = defineComponent({
  setup() {
    return { ...useEmailLogin() };
  },
  template: '<div></div>',
});

describe('useEmailLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentQuery = {};
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    i18n.global.locale.value = 'de';
  });

  it('starts on the email step and prefills the email from the query', () => {
    currentQuery = { email: 'invited@example.com' };
    const wrapper = mount(TestComponent);
    expect(wrapper.vm.step).toBe('email');
    expect(wrapper.vm.email).toBe('invited@example.com');
  });

  it('requests a code with the current locale and moves to the code step', async () => {
    const spy = vi.spyOn(authService, 'requestEmailLoginCode').mockResolvedValue({ status: 'sent' });
    const wrapper = mount(TestComponent);

    await wrapper.vm.requestCode('  user@example.com ');

    expect(spy).toHaveBeenCalledWith('user@example.com', 'de');
    expect(wrapper.vm.step).toBe('code');
    expect(wrapper.vm.email).toBe('user@example.com');
    expect(wrapper.vm.error).toBeNull();
    expect(wrapper.vm.cooldownSeconds).toBe(RESEND_COOLDOWN_SECONDS);
  });

  it.each([
    [{ status: 'invalid' as const }, 'login.email.errors.invalidEmail'],
    [{ status: 'unavailable' as const }, 'login.email.errors.unavailable'],
  ])('stays on the email step on %o', async (result, errorKey) => {
    vi.spyOn(authService, 'requestEmailLoginCode').mockResolvedValue(result);
    const wrapper = mount(TestComponent);

    await wrapper.vm.requestCode('user@example.com');

    expect(wrapper.vm.step).toBe('email');
    expect(wrapper.vm.error).toBe(i18n.global.t(errorKey));
  });

  it('uses Retry-After as cooldown when rate limited', async () => {
    vi.spyOn(authService, 'requestEmailLoginCode').mockResolvedValue({ status: 'rateLimited', retryAfter: 900 });
    const wrapper = mount(TestComponent);

    await wrapper.vm.requestCode('user@example.com');

    expect(wrapper.vm.step).toBe('email');
    expect(wrapper.vm.error).toBe(i18n.global.t('login.email.errors.rateLimited'));
    expect(wrapper.vm.cooldownSeconds).toBe(900);
  });

  it('counts the cooldown down and only allows a resend afterwards', async () => {
    vi.useFakeTimers();
    const spy = vi.spyOn(authService, 'requestEmailLoginCode').mockResolvedValue({ status: 'sent' });
    const wrapper = mount(TestComponent);
    await wrapper.vm.requestCode('user@example.com');

    await wrapper.vm.resendCode();
    expect(spy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(wrapper.vm.cooldownSeconds).toBe(RESEND_COOLDOWN_SECONDS - 1);

    vi.advanceTimersByTime(RESEND_COOLDOWN_SECONDS * 1000);
    expect(wrapper.vm.cooldownSeconds).toBe(0);

    await wrapper.vm.resendCode();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('user@example.com', 'de');
    expect(wrapper.vm.cooldownSeconds).toBe(RESEND_COOLDOWN_SECONDS);
  });

  it('navigates to the redirect target after a successful code', async () => {
    currentQuery = { redirect: '/tenancies' };
    vi.spyOn(authService, 'requestEmailLoginCode').mockResolvedValue({ status: 'sent' });
    const store = useUserSessionStore();
    vi.spyOn(store, 'loginWithEmailCode').mockResolvedValue({ status: 'success' });
    const wrapper = mount(TestComponent);
    await wrapper.vm.requestCode('user@example.com');

    await expect(wrapper.vm.submitCode('12345678')).resolves.toBe(true);

    expect(store.loginWithEmailCode).toHaveBeenCalledWith('user@example.com', '12345678');
    expect(mockReplace).toHaveBeenCalledWith('/tenancies');
  });

  it('navigates to the project selection without (or with an external) redirect target', async () => {
    currentQuery = { redirect: 'https://evil.example' };
    const store = useUserSessionStore();
    vi.spyOn(store, 'loginWithEmailCode').mockResolvedValue({ status: 'success' });
    const wrapper = mount(TestComponent);

    await wrapper.vm.submitCode('12345678');

    expect(mockReplace).toHaveBeenCalledWith({ name: 'ProjectSelection' });
  });

  it.each([
    [{ status: 'invalidCode' as const }, 'login.email.errors.invalidCode'],
    [{ status: 'invalid' as const }, 'login.email.errors.invalidCode'],
    [{ status: 'rateLimited' as const }, 'login.email.errors.tooManyAttempts'],
    [{ status: 'unavailable' as const }, 'login.email.errors.unavailable'],
  ])('shows an error and does not navigate on %o', async (result, errorKey) => {
    const store = useUserSessionStore();
    vi.spyOn(store, 'loginWithEmailCode').mockResolvedValue(result);
    const wrapper = mount(TestComponent);

    await expect(wrapper.vm.submitCode('12345678')).resolves.toBe(false);

    expect(wrapper.vm.error).toBe(i18n.global.t(errorKey));
    expect(wrapper.vm.loading).toBe(false);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('translates the error again after a locale switch', async () => {
    const store = useUserSessionStore();
    vi.spyOn(store, 'loginWithEmailCode').mockResolvedValue({ status: 'invalidCode' });
    const wrapper = mount(TestComponent);
    await wrapper.vm.submitCode('00000000');
    expect(wrapper.vm.error).toContain('ungültig');

    i18n.global.locale.value = 'en';
    await nextTick();

    expect(wrapper.vm.error).toBe('The code is invalid, expired or has already been used.');
  });

  it('changeEmail returns to the email step and clears the error', async () => {
    vi.spyOn(authService, 'requestEmailLoginCode').mockResolvedValue({ status: 'sent' });
    const store = useUserSessionStore();
    vi.spyOn(store, 'loginWithEmailCode').mockResolvedValue({ status: 'invalidCode' });
    const wrapper = mount(TestComponent);
    await wrapper.vm.requestCode('user@example.com');
    await wrapper.vm.submitCode('00000000');

    wrapper.vm.changeEmail();

    expect(wrapper.vm.step).toBe('email');
    expect(wrapper.vm.error).toBeNull();
    expect(wrapper.vm.email).toBe('user@example.com');
  });
});
