import { shallowMount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectSelectionView from '../../src/views/ManagerView.vue';
import ProjectService from '../../src/services/ProjectService';
import { useProjectStore } from '../../src/stores/ProjectStore';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/services/ProjectService');
vi.mock('@/stores/ProjectStore', () => ({
  useProjectStore: vi.fn(),
}));
vi.mock('primevue/datatable', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    actual,
    default: {
      name: 'DataTable',
      template: '<div><slot /></div>',
    },
  };
});

vi.mock('primevue/column', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    actual,
    default: {
      name: 'Column',
      template: '<div><slot /></div>',
    },
  };
});

vi.mock('primevue/button', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    actual,
    default: {
      name: 'Button',
      template: '<button><slot /></button>',
    },
  };
});

vi.mock('primevue/dialog', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    actual,
    default: {
      name: 'Dialog',
      template: '<div><slot /></div>',
    },
  };
});

describe('ManagerView.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    // Create and set Pinia instance
    const pinia = createPinia();
    setActivePinia(pinia);

    // Mock implementations
    ProjectService.mockImplementation(() => ({
      getProjects: vi.fn().mockResolvedValue({ projects: [], total: 0 }),
    }));

//    useRouter.mockReturnValue({
//      push: vi.fn(),
//    });

    useProjectStore.mockReturnValue({
      setSelectedProject: vi.fn(),
      projectId: '123',
    });

    // Mount the component with Pinia
    wrapper = shallowMount(ProjectSelectionView);
  });

  it('renders the view', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h5').text()).toBe('Übersicht der Liegenschaften');
  });

  it('opens and closes the dialog', async () => {
    expect(wrapper.vm.display).toBe(false);
    wrapper.vm.open();
    await nextTick();
    expect(wrapper.vm.display).toBe(true);
    wrapper.vm.close();
    await nextTick();
    expect(wrapper.vm.display).toBe(false);
  });
});
