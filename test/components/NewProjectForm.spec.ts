import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewProjectForm from '../../src/components/NewProjectForm.vue';
import { projectService } from '../../src/services/ProjectService';
import { useProjectStore } from '../../src/stores/ProjectStore';
import { useRouter } from 'vue-router';

// Mock project service
vi.mock('@/services/ProjectService', { spy: true });

// Mock store
vi.mock('@/stores/ProjectStore', () => ({
  useProjectStore: vi.fn(),
}));

// Mock router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}));

describe('NewProjectForm.vue', () => {
  let wrapper: VueWrapper;
  let pushMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock project service
    vi.spyOn(projectService, 'createProject').mockResolvedValue({ id: '1', title: 'Valid Project' });
  
    // Mock project store
    const mockStore = {
      searchSelectedProject: vi.fn(),
    };
    (useProjectStore as unknown as () => typeof mockStore) = () => mockStore;
  
    // Mock router
    pushMock = vi.fn();
    (useRouter as unknown as () => { push: typeof pushMock }) = () => ({ push: pushMock });
  
    // Mount component
    wrapper = mount(NewProjectForm, {
      global: {
        stubs: {
          Button: { template: '<button><slot /></button>' },
          InputText: { template: '<input />' },
        },
        mocks: {
          t: (key: string) => key, // mock i18n
        },
      },
    });
  });

  it('should render form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('[id="value"]').exists()).toBe(true);
    expect(wrapper.find('label[for="value"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    expect(wrapper.find('button[type="reset"]').exists()).toBe(true);
  });

  it('should show error message if projectTitle exceeds maxLength', async () => {
    await wrapper.find('input').setValue('a'.repeat(101));
    expect(wrapper.find('.p-error').text()).toContain('newProjectForm.title.error');
  });

  it('should call createProject and navigate to ProjectDashboard on valid submit', async () => {
    await wrapper.find('input').setValue('Valid Project');
    await wrapper.find('form').trigger('submit.prevent');

    const store = useProjectStore();
    expect(projectService.createProject).toHaveBeenCalledWith('Valid Project');
    expect(store.searchSelectedProject).toHaveBeenCalledWith('1');
    expect(pushMock).toHaveBeenCalledWith({
      name: 'ProjectDashboard',
      params: { projectId: '1' },
    });
  });

  it('should navigate to ProjectSelection on abort', async () => {
    const buttons = wrapper.findAll('button');
    const abortButton = buttons.find((btn) => btn.text() === 'button.cancel');
    expect(abortButton).toBeTruthy();
    await abortButton!.trigger('click');
    expect(pushMock).toHaveBeenCalledWith({ name: 'ProjectSelection' });
  });
});
