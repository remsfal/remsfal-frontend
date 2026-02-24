import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ProjectTopbar from '@/layout/ProjectTopbar.vue';
import { useUserSessionStore, type User } from '@/stores/UserSession';
import { useProjectStore } from '@/stores/ProjectStore';
import type { ProjectItem } from '@/services/ProjectService';

// Router mock
const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('ProjectTopbar.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  const createMockUser = (email: string = 'test@example.com'): User =>
    ({
      id: '1',
      email,
      firstName: 'Test',
      lastName: 'User',
      details: {},
      userRoles: ['MANAGER'],
    }) as unknown as User;

  const mountComponent = (user: User | null = null) => {
    const pinia = createTestingPinia({ stubActions: false });
    const userStore = useUserSessionStore(pinia);
    userStore.user = user;
    const wrapper = mount(ProjectTopbar, { global: { plugins: [pinia] } });
    return { wrapper, pinia, userStore };
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

    it.each([
      ['home button (Projekte)', 'Projekte'],
      ['new project button', 'Neues Projekt'],
      ['inbox button', 'Posteingang'],
    ])('should show %s when logged in', async (_, expectedText) => {
      const { wrapper } = mountComponent(createMockUser());
      await flushPromises();
      expect(wrapper.text()).toContain(expectedText);
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
  });


  describe('Project selector', () => {
    it('should show project selector placeholder when logged in', async () => {
      const { wrapper } = mountComponent(createMockUser());
      await flushPromises();
      expect(wrapper.html()).toContain('Projekt wählen');
    });

    it('should render project list when projects are available', async () => {
      const pinia = createTestingPinia({ stubActions: false });
      const userStore = useUserSessionStore(pinia);
      const projectStore = useProjectStore(pinia);

      userStore.user = createMockUser();
      projectStore.projects = [
        { id: 'project-1', name: 'Test Project 1', memberRole: 'MANAGER' as const } as ProjectItem,
        { id: 'project-2', name: 'Test Project 2', memberRole: 'STAFF' as const } as ProjectItem,
      ];

      const wrapper = mount(ProjectTopbar, { global: { plugins: [pinia] } });
      await flushPromises();

      expect(wrapper.find('[data-pc-name="select"]').exists()).toBe(true);
    });
  });
});
