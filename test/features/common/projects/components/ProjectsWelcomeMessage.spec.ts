import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import Message from 'primevue/message';
import ProjectsWelcomeMessage from '@/features/common/projects/components/ProjectsWelcomeMessage.vue';
import { useProjectStore } from '@/features/common/projects/stores/ProjectStore';
import type { ProjectItem } from '@/features/common/projects/services/ProjectService';

vi.mock('@/features/common/projects/stores/ProjectStore', () => ({ useProjectStore: vi.fn() }));

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

  const NewProjectDialogStub = {
    name: 'NewProjectDialog',
    props: ['visible'],
    emits: ['update:visible'],
    template: '<div class="new-project-dialog-stub" />',
  };

  const mountMessage = (): VueWrapper =>
    mount(ProjectsWelcomeMessage, { global: { stubs: { NewProjectDialog: NewProjectDialogStub } } });

  it('shows the welcome message with a create action when there are no projects', async () => {
    mockStore([]);

    const wrapper = mountMessage();
    await flushPromises();

    expect(refreshProjectListMock).toHaveBeenCalled();

    const message = wrapper.findComponent(Message);
    expect(message.exists()).toBe(true);
    expect(message.props('severity')).toBe('success');
    expect(message.find('button[type="button"]').text()).toBe('Jetzt Liegenschaft anlegen');
  });

  it('opens the new project dialog when the create action is clicked', async () => {
    mockStore([]);

    const wrapper = mountMessage();
    await flushPromises();

    const dialog = wrapper.findComponent(NewProjectDialogStub);
    expect(dialog.props('visible')).toBe(false);

    await wrapper.findComponent(Message).find('button[type="button"]').trigger('click');

    expect(dialog.props('visible')).toBe(true);

    dialog.vm.$emit('update:visible', false);
    await flushPromises();

    expect(dialog.props('visible')).toBe(false);
  });

  it('does not show the welcome message once projects are loaded', async () => {
    mockStore([{
      id: '1', name: 'Musterliegenschaft', memberRole: 'MANAGER' 
    }]);

    const wrapper = mountMessage();
    await flushPromises();

    expect(wrapper.findComponent(Message).exists()).toBe(false);
  });

  it('does not show the welcome message before the store finishes loading', () => {
    mockStore([]);

    const wrapper = mountMessage();

    expect(wrapper.findComponent(Message).exists()).toBe(false);
  });
});
