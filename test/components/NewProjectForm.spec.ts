import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewProjectForm from '../../src/components/NewProjectForm.vue';
import { projectService } from '../../src/services/ProjectService';
import { useProjectStore } from '../../src/stores/ProjectStore';
import { useRouter } from 'vue-router';

vi.mock('@/services/ProjectService', { spy: true });
vi.mock('@/stores/ProjectStore', () => ({
  useProjectStore: vi.fn(),
}));
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}));

describe('NewProjectForm.vue', () => {
  let wrapper: VueWrapper<any>;
  let pushMock: ReturnType<typeof vi.fn>;
  let storeMock: { searchSelectedProject: ReturnType<typeof vi.fn> };

  const maxLengthError = 'Der Name der Liegenschaft darf nicht mehr als 100 Zeichen lang sein';

  beforeEach(() => {
    // Mock project service
    vi.spyOn(projectService, 'createProject').mockResolvedValue({ id: '1', title: 'Valid Project' });

    // Mock project store
    storeMock = { searchSelectedProject: vi.fn() };
    (useProjectStore as unknown as () => typeof storeMock) = () => storeMock;

    // Mock router
    pushMock = vi.fn();
    (useRouter as unknown as () => { push: typeof pushMock }) = () => ({ push: pushMock });

    // Mount component
    wrapper = mount(NewProjectForm, {
      global: {
        stubs: {
          Button: { template: '<button><slot /></slot></button>' },
          InputText: {
            template:
              '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
          },
        },
      },
    });
  });

  it('should show error message if projectTitle exceeds maxLength', async () => {
    const input = wrapper.find('input');
    await input.setValue('a'.repeat(101));
    await input.trigger('input'); // ensure v-model updates
    expect(wrapper.find('.p-error').text()).toContain(maxLengthError);
  });

  it('should call createProject and navigate to ProjectDashboard on valid submit', async () => {
    const input = wrapper.find('input');
    await input.setValue('Valid Project');
    await wrapper.find('form').trigger('submit.prevent');

    expect(projectService.createProject).toHaveBeenCalledWith('Valid Project');
    expect(storeMock.searchSelectedProject).toHaveBeenCalledWith('1');
    expect(pushMock).toHaveBeenCalledWith({
      name: 'ProjectDashboard',
      params: { projectId: '1' },
    });
  });

  it('should navigate to ProjectSelection on abort', async () => {
    const abortButton = wrapper.find('button[type="reset"]');
    expect(abortButton.exists()).toBe(true);
    await abortButton.trigger('click');
    expect(pushMock).toHaveBeenCalledWith({ name: 'ProjectSelection' });
  });
});
