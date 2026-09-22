import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import Message from 'primevue/message';
import ProjectsWelcomeMessage from '@/features/manager/projects/components/ProjectsWelcomeMessage.vue';
import { useProjectStore } from '@/stores/ProjectStore';
import type { ProjectItem } from '@/services/ProjectService';

vi.mock('@/stores/ProjectStore', () => ({ useProjectStore: vi.fn() }));

describe('ProjectsWelcomeMessage.vue', () => {
  let refreshProjectListMock: ReturnType<typeof vi.fn>;

  function mockStore(projectList: ProjectItem[]) {
    refreshProjectListMock = vi.fn().mockResolvedValue(undefined);
    (useProjectStore as unknown as () => { projectList: ProjectItem[]; refreshProjectList: typeof refreshProjectListMock }) =
      () => ({ projectList, refreshProjectList: refreshProjectListMock });
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the welcome message with a link to the properties page when there are no projects', async () => {
    mockStore([]);

    const wrapper: VueWrapper = mount(ProjectsWelcomeMessage);
    await flushPromises();

    expect(refreshProjectListMock).toHaveBeenCalled();

    const message = wrapper.findComponent(Message);
    expect(message.exists()).toBe(true);
    expect(message.props('severity')).toBe('success');

    const link = wrapper.find('a[href="/manager/projects"]');
    expect(link.exists()).toBe(true);
  });

  it('does not show the welcome message once projects are loaded', async () => {
    mockStore([{
      id: '1', name: 'Musterliegenschaft', memberRole: 'MANAGER' 
    }]);

    const wrapper: VueWrapper = mount(ProjectsWelcomeMessage);
    await flushPromises();

    expect(wrapper.findComponent(Message).exists()).toBe(false);
  });

  it('does not show the welcome message before the store finishes loading', () => {
    mockStore([]);

    const wrapper: VueWrapper = mount(ProjectsWelcomeMessage);

    expect(wrapper.findComponent(Message).exists()).toBe(false);
  });
});
