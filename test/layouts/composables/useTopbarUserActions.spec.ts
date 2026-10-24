import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTopbarUserActions } from '@/layouts/composables/useTopbarUserActions';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { clearUserClientData } from '@/helper/clientDataCleanup';

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

vi.mock('@/helper/clientDataCleanup', () => ({ clearUserClientData: vi.fn() }));

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

  it('login navigates to the login page keeping the redirect query param', () => {
    currentQuery = { redirect: '/dashboard' };
    const wrapper = mount(TestComponent);
    wrapper.vm.login();
    expect(mockPush).toHaveBeenCalledWith({ name: 'Login', query: { redirect: '/dashboard' } });
  });

  it('login uses the current fullPath as redirect when no redirect param', () => {
    currentPath = '/verify-additional-email';
    const wrapper = mount(TestComponent);
    wrapper.vm.login();
    expect(mockPush).toHaveBeenCalledWith({ name: 'Login', query: { redirect: '/verify-additional-email' } });
  });

  it('login omits the redirect when on the root path', () => {
    const wrapper = mount(TestComponent);
    wrapper.vm.login();
    expect(mockPush).toHaveBeenCalledWith({ name: 'Login', query: { redirect: undefined } });
  });

  it('logout clears user client data before navigating to the logout URL', async () => {
    let pathnameDuringCleanup: string | undefined;
    vi.mocked(clearUserClientData).mockImplementation(async () => {
      pathnameDuringCleanup = globalThis.location.pathname;
    });
    const wrapper = mount(TestComponent);

    await wrapper.vm.logout();

    expect(clearUserClientData).toHaveBeenCalledOnce();
    expect(pathnameDuringCleanup).toBe('');
    expect(globalThis.location.pathname).toBe('/api/v1/authentication/logout');
  });

  it('navigates to contractor account data when on contractor route', () => {
    currentPath = '/contractor/dashboard';
    const wrapper = mount(TestComponent);
    wrapper.vm.onAccountSettingsClick();
    expect(mockPush).toHaveBeenCalledWith('/contractor/account-data');
  });

  it('navigates to tenant account data when on tenant route', () => {
    currentPath = '/tenant/dashboard';
    const wrapper = mount(TestComponent);
    wrapper.vm.onAccountSettingsClick();
    expect(mockPush).toHaveBeenCalledWith('/tenant/account-data');
  });

  it('navigates to manager account data when on manager route', () => {
    currentPath = '/manager/dashboard';
    const wrapper = mount(TestComponent);
    wrapper.vm.onAccountSettingsClick();
    expect(mockPush).toHaveBeenCalledWith('/manager/account-data');
  });
});
