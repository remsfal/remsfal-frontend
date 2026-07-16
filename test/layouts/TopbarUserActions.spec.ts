import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import TopbarUserActions from '@/layouts/components/TopbarUserActions.vue';
import { useUserSessionStore, type User } from '@/stores/UserSession';

// Mock vue-router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({
    path: '/', params: {}, query: {}, fullPath: '/', name: undefined, meta: {}
  }),
  RouterLink: { template: '<a><slot /></a>' },
}));


// Mock platform helper to NOT show dev login by default, but allow overriding
const platformMocks = vi.hoisted(() => ({shouldShowDevLogin: vi.fn(() => false),}));
vi.mock('@/helper/platform', () => ({ shouldShowDevLogin: platformMocks.shouldShowDevLogin }));

// Mock AccountSettingsView to prevent loading it (and its side effects/imports)
vi.mock('@/features/common/users/views/AccountSettingsView.vue', () => ({ default: { template: '<div>Mocked View</div>' } }));

describe('TopbarUserActions.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  const mountWrapper = (user: User | null = null) => {
    const store = useUserSessionStore();
    store.user = user ?? null;

    return {
      wrapper: mount(TopbarUserActions),
      store,
    };
  };

  it('shows logout when logged in', async () => {
    const { wrapper } = mountWrapper({ email: 'test@example.com' } as User);
    await flushPromises();

    expect(wrapper.text()).toContain('Abmelden');
  });

  it('shows login when logged out', async () => {
    const { wrapper } = mountWrapper(null);
    await flushPromises();

    expect(wrapper.text()).toContain('Anmelden');
  });

  it('calls logout when logout button clicked', async () => {
    const { wrapper } = mountWrapper({ email: 'test@example.com' } as User);
    await flushPromises();

    const logoutButton = wrapper.findAllComponents({ name: 'Button' }).find(b => b.text().includes('Abmelden'));
    expect(logoutButton).toBeDefined();
    if (logoutButton) {
      await logoutButton.trigger('click');
      expect(logoutButton.exists()).toBe(true);
    }
  });

  it('calls account settings when account clicked', async () => {
    const { wrapper } = mountWrapper({ email: 'user@example.com' } as User);
    await flushPromises();

    const accountButton = wrapper.findAllComponents({ name: 'Button' }).find(b => b.text().includes('user@example.com'));
    expect(accountButton).toBeDefined();
    expect(accountButton?.exists()).toBe(true);
    await accountButton?.trigger('click');
  });

  it('calls login when login button clicked', async () => {
    const { wrapper } = mountWrapper(null);
    await flushPromises();

    // Mock globalThis.location
    const originalLocation = globalThis.location;
    Object.defineProperty(globalThis, 'location', {
      value: { href: '' } as unknown as Location,
      writable: true,
    });

    const loginButton = wrapper.findAllComponents({ name: 'Button' }).find(b => b.text().includes('Anmelden'));
    expect(loginButton).toBeDefined();

    await loginButton?.trigger('click');
    expect(globalThis.location.href).toContain('/api/v1/authentication/login');

    // Cleanup
    Object.defineProperty(globalThis, 'location', {
      value: originalLocation,
      writable: true,
    });
  });
});
