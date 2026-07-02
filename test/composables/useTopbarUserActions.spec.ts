import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTopbarUserActions } from '@/composables/useTopbarUserActions';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';

let currentPath = '/';
let currentQuery: Record<string, string> = {};

const mockPush = vi.fn();
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
    useRoute: () => ({
      get path() { return currentPath; },
      get query() { return currentQuery; },
      get fullPath() {
        const params = new URLSearchParams(currentQuery).toString();
        return currentPath + (params ? '?' + params : '');
      },
    }),
  };
});

// Mock useI18n
vi.mock('vue-i18n', () => ({useI18n: () => ({ t: (key: string) => key }),}));

// Mock globalThis location
const originalLocation = globalThis.location;

describe('useTopbarUserActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPath = '/';
    currentQuery = {};

    // Mock globalThis.location
    Object.defineProperty(globalThis, 'location', {
      value: {
        href: '',
        pathname: '',
        assign: vi.fn(),
      } as unknown as Location,
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
      return { ...useTopbarUserActions() };
    },
    template: '<div></div>',
  });

  it('login uses redirect query param when present', () => {
    currentQuery = { redirect: '/dashboard' };
    const wrapper = mount(TestComponent);
    wrapper.vm.login();
    expect(globalThis.location.href).toBe('/api/v1/authentication/login?route=%2Fdashboard');
  });

  it('login falls back to current fullPath when no redirect param', () => {
    const wrapper = mount(TestComponent);
    wrapper.vm.login();
    expect(globalThis.location.href).toBe('/api/v1/authentication/login?route=%2F');
  });

  it('logout navigates to correct URL', () => {
    const wrapper = mount(TestComponent);
    wrapper.vm.logout();
    expect(globalThis.location.pathname).toBe('/api/v1/authentication/logout');
  });

  it('navigates to contractor account settings when on contractor route', () => {
    currentPath = '/contractor/dashboard';
    const wrapper = mount(TestComponent);
    wrapper.vm.onAccountSettingsClick();
    expect(mockPush).toHaveBeenCalledWith('/contractor/account-settings');
  });

  it('navigates to tenant account settings when on tenancies route', () => {
    currentPath = '/tenancies/dashboard';
    const wrapper = mount(TestComponent);
    wrapper.vm.onAccountSettingsClick();
    expect(mockPush).toHaveBeenCalledWith('/tenancies/account-settings');
  });

  it('navigates to manager account settings when on manager route', () => {
    currentPath = '/manager/dashboard';
    const wrapper = mount(TestComponent);
    wrapper.vm.onAccountSettingsClick();
    expect(mockPush).toHaveBeenCalledWith('/manager/account-settings');
  });
});
