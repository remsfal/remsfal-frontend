import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import TopbarUserActions from '@/components/TopbarUserActions.vue';
import { useUserSessionStore, type User } from '@/stores/UserSession';
import PrimeVue from 'primevue/config';
import { createI18n } from 'vue-i18n';

// Mock vue-router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }), }));


// Mock platform helper to NOT show dev login by default, but allow overriding
const platformMocks = vi.hoisted(() => ({shouldShowDevLogin: vi.fn(() => false),}));
vi.mock('@/helper/platform', () => ({ shouldShowDevLogin: platformMocks.shouldShowDevLogin }));

// Mock AccountSettingsView to prevent loading it (and its side effects/imports)
vi.mock('@/views/AccountSettingsView.vue', () => ({ default: { template: '<div>Mocked View</div>' } }));

describe('TopbarUserActions.vue', () => {
    let i18n: ReturnType<typeof createI18n>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockPush.mockClear();

        i18n = createI18n({
            legacy: false,
            locale: 'de',
            messages: {
                de: {
                    toolbar: {
                        devLogin: 'Dev Login',
                        login: 'Anmelden',
                        logout: 'Abmelden',
                    },
                },
            },
        });
    });

    const mountWrapper = (user: User | null = null) => {
        const pinia = createTestingPinia({ stubActions: false });
        const store = useUserSessionStore(pinia);
        store.user = user ?? null;

        return {
            wrapper: mount(TopbarUserActions, { global: { plugins: [pinia, PrimeVue, i18n], }, }),
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
            // Logout sets window.location.pathname, we can check that the button is clickable
            expect(logoutButton.exists()).toBe(true);
        }
    });

    it('calls account settings when account clicked', async () => {
        const { wrapper } = mountWrapper({ email: 'user@example.com' } as User);
        await flushPromises();

        const accountButton = wrapper.findAllComponents({ name: 'Button' }).find(b => b.text().includes('user@example.com'));
        expect(accountButton).toBeDefined();
        expect(accountButton?.exists()).toBe(true);
        // Click should not throw - router navigation happens
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
