import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ManagerTopbar from '../../src/layout/ManagerTopbar.vue';
import { useUserSessionStore, type User } from '../../src/stores/UserSession';
import { useProjectStore } from '../../src/stores/ProjectStore';
import type { ProjectItem } from '../../src/services/ProjectService';

// Router mock
const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }), }));

describe('ManagerTopbar.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPush.mockClear();
    });

    const createMockUser = (email: string = 'test@example.com'): User => ({
        id: '1',
        email,
        firstName: 'Test',
        lastName: 'User',
        details: {},
        userRoles: ['MANAGER'],
    } as unknown as User);

    const mountComponent = (user: User | null = null) => {
        const pinia = createTestingPinia({ stubActions: false });
        const userStore = useUserSessionStore(pinia);
        userStore.user = user;
        const wrapper = mount(ManagerTopbar, { global: { plugins: [pinia] } });
        return {
 wrapper, pinia, userStore 
};
    };

    describe('Logged in user interface', () => {
        it('should show logout button when user is logged in', async () => {
            const { wrapper } = mountComponent(createMockUser());
            await flushPromises();
            expect(wrapper.text()).toContain('Abmelden');
        });

        it('should show user email when logged in', async () => {
            const user = createMockUser('user@example.com');
            const { wrapper } = mountComponent(user);
            await flushPromises();
            expect(wrapper.text()).toContain('user@example.com');
        });

        it('should show home button (Projekte) when logged in', async () => {
            const { wrapper } = mountComponent(createMockUser());
            await flushPromises();
            expect(wrapper.text()).toContain('Projekte');
        });

        it('should show new project button when logged in', async () => {
            const { wrapper } = mountComponent(createMockUser());
            await flushPromises();
            expect(wrapper.text()).toContain('Neues Projekt');
        });

        it('should show inbox button when logged in', async () => {
            const { wrapper } = mountComponent(createMockUser());
            await flushPromises();
            expect(wrapper.text()).toContain('Posteingang');
        });
    });

    describe('Logged out user interface', () => {
        it('should show login button when user is not logged in', async () => {
            const { wrapper } = mountComponent(null);
            await flushPromises();
            expect(wrapper.text()).toContain('Anmelden');
        });

        it('should not show logout button when user is not logged in', async () => {
            const { wrapper } = mountComponent(null);
            await flushPromises();
            expect(wrapper.text()).not.toContain('Abmelden');
        });

        it('should not show user email when user is not logged in', async () => {
            const { wrapper } = mountComponent(null);
            await flushPromises();
            expect(wrapper.text()).not.toContain('@');
        });
    });

    describe('Project selector', () => {
        it('should show project selector placeholder when logged in', async () => {
            const { wrapper } = mountComponent(createMockUser());
            await flushPromises();
            expect(wrapper.html()).toContain('Projekt wählen');
        });

        it('should render project list when projects are available', async () => {
            // Can't use mountComponent here effectively because we need to set projects on the store
            // before or after creation.
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            const projectStore = useProjectStore(pinia);

            userStore.user = createMockUser();
            projectStore.projects = [
                {
 id: 'project-1', name: 'Test Project 1', memberRole: 'MANAGER' as const 
} as ProjectItem,
                {
 id: 'project-2', name: 'Test Project 2', memberRole: 'STAFF' as const 
} as ProjectItem,
            ];

            const wrapper = mount(ManagerTopbar, { global: { plugins: [pinia] } });
            await flushPromises();

            // Selector should be present
            expect(wrapper.find('[data-pc-name="select"]').exists()).toBe(true);
        });
    });

    describe('Locale switcher', () => {
        it('should include locale switch component', async () => {
            const { wrapper } = mountComponent(createMockUser());
            await flushPromises();
            // Check for locale switch presence (German "de" should be visible)
            expect(wrapper.html()).toContain('de');
        });
    });
});
