import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useLogin } from '@/features/common/authentication/composables/useLogin';
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

const platformMocks = vi.hoisted(() => ({ shouldShowDevLogin: vi.fn(() => false) }));
vi.mock('@/helper/platform', () => ({ shouldShowDevLogin: platformMocks.shouldShowDevLogin }));

const originalLocation = globalThis.location;

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentQuery = {};
    Object.defineProperty(globalThis, 'location', {
      value: { href: '' } as unknown as Location,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  const TestComponent = defineComponent({
    setup() {
      return { ...useLogin() };
    },
    template: '<div></div>',
  });

  it.each(['google', 'apple'] as const)('loginWith(%s) redirects to the provider login endpoint', (provider) => {
    currentQuery = { redirect: '/manager/projects' };
    const wrapper = mount(TestComponent);
    wrapper.vm.loginWith(provider);
    expect(globalThis.location.href)
      .toBe(`/api/v1/authentication/login/${provider}?route=%2Fmanager%2Fprojects`);
  });

  it('loginWith falls back to the root route without redirect param', () => {
    const wrapper = mount(TestComponent);
    wrapper.vm.loginWith('apple');
    expect(globalThis.location.href).toBe('/api/v1/authentication/login/apple?route=%2F');
  });

  it('loginWith ignores external redirect targets', () => {
    currentQuery = { redirect: 'https://evil.example' };
    const wrapper = mount(TestComponent);
    wrapper.vm.loginWith('google');
    expect(globalThis.location.href).toBe('/api/v1/authentication/login/google?route=%2F');
  });

  it('loginDev navigates to the redirect target on success', async () => {
    currentQuery = { redirect: '/tenant/dashboard' };
    const store = useUserSessionStore();
    vi.mocked(store.loginDev).mockResolvedValue(true);
    const wrapper = mount(TestComponent);

    await expect(wrapper.vm.loginDev()).resolves.toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/tenant/dashboard');
  });

  it('loginDev navigates to the project selection without redirect param', async () => {
    const store = useUserSessionStore();
    vi.mocked(store.loginDev).mockResolvedValue(true);
    const wrapper = mount(TestComponent);

    await wrapper.vm.loginDev();
    expect(mockReplace).toHaveBeenCalledWith({ name: 'ProjectSelection' });
  });

  it('loginDev does not navigate on failure', async () => {
    const store = useUserSessionStore();
    vi.mocked(store.loginDev).mockResolvedValue(false);
    const wrapper = mount(TestComponent);

    await expect(wrapper.vm.loginDev()).resolves.toBe(false);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('showDevLogin reflects the platform helper', () => {
    platformMocks.shouldShowDevLogin.mockReturnValue(true);
    const wrapper = mount(TestComponent);
    expect(wrapper.vm.showDevLogin).toBe(true);
  });
});
