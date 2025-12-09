import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import TopbarUserActions from '../../src/components/TopbarUserActions.vue';
import { useUserSessionStore } from '../../src/stores/UserSession';
import { useTopbarUserActions } from '@/composables/useTopbarUserActions';
import { ref } from 'vue';

// Router mock
const mockPush = vi.fn();
vi.mock('vue-router', () => ({useRouter: () => ({ push: mockPush }),}));

// Mock composable
vi.mock('@/composable/useTopbarUserActions', () => ({useTopbarUserActions: vi.fn(),}));

describe('TopbarUserActions.vue', () => {
    let mockActions: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockPush.mockClear();

        // Reset mock actions for each test
        mockActions = {
            t: (key: string) => {
                if (key === 'toolbar.devLogin') return 'Dev Login';
                if (key === 'toolbar.login') return 'Anmelden';
                if (key === 'toolbar.logout') return 'Abmelden';
                return key;
            },
            sessionStore: { user: null },
            onAccountSettingsClick: vi.fn(),
            logout: vi.fn(),
            login: vi.fn(),
            loginDev: vi.fn(),
            showDevLoginButton: ref(false),
        };

        (useTopbarUserActions as any).mockReturnValue(mockActions);
    });

    describe('Logged in user interface', () => {
        it('should show logout button when user is logged in', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            userStore.user = { email: 'test@example.com' } as any;

            mockActions.sessionStore = userStore;

            const wrapper = mount(TopbarUserActions, {global: { plugins: [pinia] },});

            await flushPromises();

            expect(wrapper.text()).toContain('Abmelden');
        });

        it('should show user email when logged in', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            userStore.user = { email: 'user@example.com' } as any;
            mockActions.sessionStore = userStore;

            const wrapper = mount(TopbarUserActions, {global: { plugins: [pinia] },});

            await flushPromises();

            expect(wrapper.text()).toContain('user@example.com');
        });
    });

    describe('Logged out user interface', () => {
        it('should show login button when user is not logged in', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            userStore.user = null;

            mockActions.sessionStore = userStore;
            mockActions.showDevLoginButton.value = false;

            const wrapper = mount(TopbarUserActions, {global: { plugins: [pinia] },});

            await flushPromises();

            expect(wrapper.text()).toContain('Anmelden');
        });
    });
});
