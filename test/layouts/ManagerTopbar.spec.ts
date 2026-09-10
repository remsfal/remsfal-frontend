import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ManagerTopbar from '@/layouts/components/ManagerTopbar.vue';
import { useUserSessionStore, type User } from '@/stores/UserSession';
import { useProjectStore } from '@/stores/ProjectStore';
import { useActivityFeedStore } from '@/features/manager/activityFeeds/stores/ActivityFeedStore';
import type { ProjectItem } from '@/services/ProjectService';
import Select from 'primevue/select';

// Router mock
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({
    params: {}, query: {}, fullPath: '/', name: undefined, meta: {}
  }),
  RouterLink: { template: '<a><slot /></a>' },
}));

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
    const userStore = useUserSessionStore();
    userStore.user = user;
    const wrapper = mount(ManagerTopbar);
    return { wrapper, userStore };
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
      ['activity feed button', 'Aktivitäten'],
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
      const userStore = useUserSessionStore();
      const projectStore = useProjectStore();

      userStore.user = createMockUser();
      projectStore.projects = [
        {
          id: 'project-1',
          name: 'Test Project 1',
          memberRole: 'MANAGER' as const,
        } as ProjectItem,
        {
          id: 'project-2',
          name: 'Test Project 2',
          memberRole: 'STAFF' as const,
        } as ProjectItem,
      ];

      const wrapper = mount(ManagerTopbar);
      await flushPromises();

      expect(wrapper.find('[data-pc-name="select"]').exists()).toBe(true);
    });
  });

  describe('Locale switcher', () => {
    it('should include locale switch component', async () => {
      const { wrapper } = mountComponent(createMockUser());
      await flushPromises();
      expect(wrapper.html()).toContain('de');
    });
  });

  describe('Navigation actions', () => {
    it('refreshes the project list and navigates home when the home button is clicked', async () => {
      const { wrapper } = mountComponent(createMockUser());
      const projectStore = useProjectStore();
      const refreshSpy = vi.spyOn(projectStore, 'refreshProjectList').mockResolvedValue(undefined);
      await flushPromises();

      const homeButton = wrapper.findAll('button.layout-topbar-shortcut-button')[0];
      await homeButton.trigger('click');

      expect(refreshSpy).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith({ name: 'ProjectSelection' });
    });

    it('navigates to the activity feed when the bell button is clicked', async () => {
      const { wrapper } = mountComponent(createMockUser());
      await flushPromises();

      const activityFeedButton = wrapper.findAll('button.layout-topbar-shortcut-button')[1];
      await activityFeedButton.trigger('click');

      expect(mockPush).toHaveBeenCalledWith({ name: 'ActivityFeeds' });
    });

    it('selects a project and navigates to its dashboard on selection change', async () => {
      const { wrapper } = mountComponent(createMockUser());
      const projectStore = useProjectStore();
      const project: ProjectItem = {
        id: 'project-1', name: 'Test Project 1', memberRole: 'MANAGER' 
      };
      await flushPromises();

      const select = wrapper.findComponent(Select);
      await select.vm.$emit('update:modelValue', project);
      await select.vm.$emit('change', { value: project });

      expect(projectStore.selectedProject).toEqual(project);
      expect(mockPush).toHaveBeenCalledWith({ name: 'ProjectDashboard', params: { projectId: 'project-1' } });
    });

    it('navigates with an empty projectId when the selected project has none', async () => {
      const { wrapper } = mountComponent(createMockUser());
      await flushPromises();

      const select = wrapper.findComponent(Select);
      await select.vm.$emit('change', { value: { name: 'No Id Project' } as ProjectItem });

      expect(mockPush).toHaveBeenCalledWith({ name: 'ProjectDashboard', params: { projectId: '' } });
    });
  });

  describe('Unread activity badge', () => {
    it('shows no badge when the activity feed has no entries yet', async () => {
      const { wrapper } = mountComponent(createMockUser());
      const activityFeedStore = useActivityFeedStore();
      activityFeedStore.entries = undefined as unknown as typeof activityFeedStore.entries;
      await flushPromises();

      expect(wrapper.find('.unread-badge').exists()).toBe(false);
    });
  });

  describe('Project list options', () => {
    it('falls back to an empty list when the project store throws', async () => {
      const userStore = useUserSessionStore();
      userStore.user = createMockUser();
      const projectStore = useProjectStore();
      Object.defineProperty(projectStore, 'projectList', {
        configurable: true,
        get() {
          throw new Error('project store not initialized');
        },
      });

      const wrapper = mount(ManagerTopbar);
      await flushPromises();

      expect(wrapper.find('[data-pc-name="select"]').exists()).toBe(true);
    });

    it('falls back to an empty list when the project list is not an array', async () => {
      const userStore = useUserSessionStore();
      userStore.user = createMockUser();
      const projectStore = useProjectStore();
      Object.defineProperty(projectStore, 'projectList', {
        configurable: true,
        get: () => null,
      });

      const wrapper = mount(ManagerTopbar);
      await flushPromises();

      expect(wrapper.find('[data-pc-name="select"]').exists()).toBe(true);
    });
  });
});
