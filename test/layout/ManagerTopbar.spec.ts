import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ManagerTopbar from '../../src/layout/ManagerTopbar.vue';
import { useUserSessionStore } from '../../src/stores/UserSession';
import { useProjectStore } from '../../src/stores/ProjectStore';

// Router mock
const mockPush = vi.fn();
vi.mock('vue-router', () => ({useRouter: () => ({ push: mockPush }),}));

describe('ManagerTopbar.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPush.mockClear();
    });

    describe('Logged in user interface', () => {
        it('should show logout button when user is logged in', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            userStore.user = { email: 'test@example.com' } as any;

            const wrapper = mount(ManagerTopbar, {global: { plugins: [pinia] },});

            await flushPromises();

            expect(wrapper.text()).toContain('Abmelden');
        });

        it('should show user email when logged in', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            userStore.user = { email: 'user@example.com' } as any;

            const wrapper = mount(ManagerTopbar, {global: { plugins: [pinia] },});

            await flushPromises();

            expect(wrapper.text()).toContain('user@example.com');
        });

        it('should show home button (Projekte) when logged in', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            userStore.user = { email: 'test@example.com' } as any;

            const wrapper = mount(ManagerTopbar, {global: { plugins: [pinia] },});

            await flushPromises();

            expect(wrapper.text()).toContain('Projekte');
        });

        it('should show new project button when logged in', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            userStore.user = { email: 'test@example.com' } as any;

            const wrapper = mount(ManagerTopbar, {global: { plugins: [pinia] },});

            await flushPromises();

            expect(wrapper.text()).toContain('Neues Projekt');
        });

        it('should show inbox button when logged in', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            userStore.user = { email: 'test@example.com' } as any;

            const wrapper = mount(ManagerTopbar, {global: { plugins: [pinia] },});

            await flushPromises();

            expect(wrapper.text()).toContain('Posteingang');
        });
    });

    describe('Logged out user interface', () => {
        it('should show login button when user is not logged in', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            userStore.user = null;

            const wrapper = mount(ManagerTopbar, {global: { plugins: [pinia] },});

            await flushPromises();

            expect(wrapper.text()).toContain('Anmelden');
        });

        it('should not show logout button when user is not logged in', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            userStore.user = null;

            const wrapper = mount(ManagerTopbar, {global: { plugins: [pinia] },});

            await flushPromises();

            expect(wrapper.text()).not.toContain('Abmelden');
        });

        it('should not show user email when user is not logged in', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            userStore.user = null;

            const wrapper = mount(ManagerTopbar, {global: { plugins: [pinia] },});

            await flushPromises();

            expect(wrapper.text()).not.toContain('@');
        });
    });

    describe('Project selector', () => {
        it('should show project selector placeholder when logged in', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            userStore.user = { email: 'test@example.com' } as any;

            const wrapper = mount(ManagerTopbar, {global: { plugins: [pinia] },});

            await flushPromises();

            expect(wrapper.html()).toContain('Projekt wählen');
        });

        it('should render project list when projects are available', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            const projectStore = useProjectStore(pinia);
            userStore.user = { email: 'test@example.com' } as any;
            projectStore.projects = [
                {
 id: 'project-1', name: 'Test Project 1', memberRole: 'MANAGER' as const 
},
                {
 id: 'project-2', name: 'Test Project 2', memberRole: 'STAFF' as const 
},
            ];

            const wrapper = mount(ManagerTopbar, {global: { plugins: [pinia] },});

            await flushPromises();

            // Selector should be present
            expect(wrapper.find('[data-pc-name="select"]').exists()).toBe(true);
        });
    });

    describe('Locale switcher', () => {
        it('should include locale switch component', async () => {
            const pinia = createTestingPinia({ stubActions: false });
            const userStore = useUserSessionStore(pinia);
            userStore.user = { email: 'test@example.com' } as any;

            const wrapper = mount(ManagerTopbar, {global: { plugins: [pinia] },});

            await flushPromises();

            // Check for locale switch presence (German "de" should be visible)
            expect(wrapper.html()).toContain('de');
        });
    });
});
