import { shallowMount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import ManagerView from '@/features/manager/projects/views/ManagerView.vue';
import NewProjectDialog from '@/features/manager/projects/components/NewProjectDialog.vue';
import { projectService } from '@/services/ProjectService';
import { useProjectStore } from '@/stores/ProjectStore';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/services/ProjectService', () => ({
  projectService: {
    getProjects: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    getProjectById: vi.fn(),
  },
}));

vi.mock('@/stores/ProjectStore', () => ({ useProjectStore: vi.fn() }));

vi.mock('primevue/button', () => ({
  default: { name: 'Button', template: '<button @click="$emit(\'click\')"><slot /></button>' },
}));

describe('ManagerView.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);

    (projectService.getProjects as Mock).mockResolvedValue({ projects: [], total: 0 });

    (useProjectStore as unknown as Mock).mockReturnValue({
      setSelectedProject: vi.fn(),
      projectId: '123',
    });

    wrapper = shallowMount(ManagerView, {
      global: { stubs: { Button: false } },
    });
  });

  it('renders the view', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('toggles the dialog visibility when the add button is clicked', async () => {
    const dialog = () => wrapper.findComponent(NewProjectDialog);

    expect(dialog().props('visible')).toBe(false);

    await wrapper.find('button').trigger('click');
    expect(dialog().props('visible')).toBe(true);
  });
});
