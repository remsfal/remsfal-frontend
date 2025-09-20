import { shallowMount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import ProjectSelectionView from '../../src/views/ManagerView.vue';
import { projectService } from '../../src/services/ProjectService';
import { useProjectStore } from '../../src/stores/ProjectStore';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

// Mock projectService singleton
vi.mock('@/services/ProjectService', () => ({
  projectService: {
    getProjects: vi.fn(),
  },
}));

// Mock Pinia store
vi.mock('@/stores/ProjectStore', () => ({
  useProjectStore: vi.fn(),
}));

// PrimeVue stubs
vi.mock('primevue/datatable', () => ({
  default: { name: 'DataTable', template: '<div><slot /></div>' },
}));
vi.mock('primevue/column', () => ({
  default: { name: 'Column', template: '<div><slot /></div>' },
}));
vi.mock('primevue/button', () => ({
  default: { name: 'Button', template: '<button><slot /></button>' },
}));
vi.mock('primevue/dialog', () => ({
  default: { name: 'Dialog', template: '<div><slot /></div>' },
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

    wrapper = shallowMount(ProjectSelectionView);
  });

  it('renders the view', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h5').text()).toBe('Übersicht der Liegenschaften');
  });

  it('opens and closes the dialog', async () => {
    const vm = wrapper.vm as any;

    expect(vm.display).toBe(false);
    vm.open();
    await nextTick();
    expect(vm.display).toBe(true);
    vm.close();
    await nextTick();
    expect(vm.display).toBe(false);
  });
});
