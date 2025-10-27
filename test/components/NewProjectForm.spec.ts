import {
 describe, it, expect, vi, beforeEach 
} from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewProjectForm from '../../src/components/NewProjectForm.vue';
import { projectService } from '../../src/services/ProjectService';
import { useProjectStore } from '../../src/stores/ProjectStore';
import { useRouter } from 'vue-router';

vi.mock('@/services/ProjectService', { spy: true });
vi.mock('@/stores/ProjectStore', () => ({useProjectStore: vi.fn(),}));
vi.mock('vue-router', () => ({useRouter: vi.fn(),}));

describe('NewProjectForm.vue', () => {
  let wrapper: VueWrapper<any>;
  let pushMock: ReturnType<typeof vi.fn>;
  let storeMock: { 
    addProjectToList: ReturnType<typeof vi.fn>;
    setSelectedProject: ReturnType<typeof vi.fn>;
  };

  const maxLengthError = 'Der Name der Liegenschaft darf nicht mehr als 100 Zeichen lang sein';

  beforeEach(() => {
    vi.spyOn(projectService, 'createProject').mockResolvedValue({
      id: '1',
      title: 'Valid Project',
    });

    storeMock = { 
      addProjectToList: vi.fn(),
      setSelectedProject: vi.fn()
    };
    (useProjectStore as unknown as () => typeof storeMock) = () => storeMock;

    pushMock = vi.fn();
    (useRouter as unknown as () => { push: typeof pushMock }) = () => ({ push: pushMock });

    wrapper = mount(NewProjectForm, {
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></slot></button>' },
          InputText: {
            template: `<input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />`,
            props: ['modelValue'],
          },
        },
      },
    });
  });

  it('shows error message if projectTitle exceeds maxLength', async () => {
    const input = wrapper.find('#projectTitle');
    expect(input.exists()).toBe(true);
    await input.setValue('a'.repeat(101));
    expect(wrapper.find('.p-error').text()).toContain(maxLengthError);
  });

  it('calls createProject and navigates on valid submit', async () => {
    const input = wrapper.find('#projectTitle');
    await input.setValue('Valid Project');

    // Find the "create" button by its index (second button) or label
    const buttons = wrapper.findAll('button');
    const createButton = buttons[1]; // assuming the second button is "Create"
    await createButton.trigger('click');

    expect(projectService.createProject).toHaveBeenCalledWith('Valid Project');
    expect(storeMock.addProjectToList).toHaveBeenCalledWith({
      id: '1',
      name: 'Valid Project',
      memberRole: 'MANAGER'
    });
    expect(storeMock.setSelectedProject).toHaveBeenCalledWith({
      id: '1',
      name: 'Valid Project',
      memberRole: 'MANAGER'
    });
    expect(pushMock).toHaveBeenCalledWith({
      name: 'ProjectDashboard',
      params: { projectId: '1' },
    });
  });

  it('navigates to ProjectSelection on abort', async () => {
    const cancelButton = wrapper.findAll('button').find((b) => b.text() === '');
    await cancelButton?.trigger('click');

    expect(pushMock).toHaveBeenCalledWith({ name: 'ProjectSelection' });
  });
});
