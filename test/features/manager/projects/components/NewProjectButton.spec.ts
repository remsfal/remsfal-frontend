import {describe, it, expect, vi, beforeEach} from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewProjectButton from '@/features/manager/projects/components/NewProjectButton.vue';
import { projectService } from '@/services/ProjectService';
import { useProjectStore } from '@/stores/ProjectStore';
import { useRouter } from 'vue-router';
import { Form } from '@primevue/forms';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';

vi.mock('@/services/ProjectService', { spy: true });
vi.mock('@/stores/ProjectStore', () => ({useProjectStore: vi.fn(),}));
vi.mock('vue-router', () => ({useRouter: vi.fn(),}));

describe('NewProjectButton.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof NewProjectButton>>;
  let pushMock: ReturnType<typeof vi.fn>;
  let storeMock: {
    addProjectToList: ReturnType<typeof vi.fn>;
    setSelectedProject: ReturnType<typeof vi.fn>;
  };

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

    wrapper = mount(NewProjectButton, {
      global: {
        stubs: {
          Dialog: { props: ['visible'], template: '<div v-if="visible"><slot /></div>' },
          Button: { template: '<button type="button" @click="$emit(\'click\')"><slot /></button>' },
        },
        components: {
          Form,
          InputText,
          Message,
        },
      },
    });
  });

  it('opens the dialog when the add button is clicked', async () => {
    expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(false);

    await wrapper.find('button').trigger('click');

    expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(true);
  });

  it('shows error message if projectTitle is too short', async () => {
    await wrapper.find('button').trigger('click');

    const input = wrapper.find('input[name="projectTitle"]');
    expect(input.exists()).toBe(true);

    // Set value with less than 3 characters and blur
    await input.setValue('AB');
    await input.trigger('blur');

    await new Promise(resolve => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    // Error should be shown in Message component
    const errorMessage = wrapper.findComponent(Message);
    expect(errorMessage.exists()).toBe(true);
  });

  it('shows error message if projectTitle exceeds maxLength', async () => {
    await wrapper.find('button').trigger('click');

    const input = wrapper.find('input[name="projectTitle"]');
    expect(input.exists()).toBe(true);

    // Set value and blur to trigger validation (touched state)
    await input.setValue('a'.repeat(101));
    await input.trigger('blur');

    await new Promise(resolve => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    // Error should be shown in Message component
    const errorMessage = wrapper.findComponent(Message);
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toContain('100'); // Should contain max length
  });

  it('disables submit button initially', async () => {
    await wrapper.find('button').trigger('click');

    // Button should be disabled initially (empty form, not dirty)
    // buttons after opening: [0] add (outside dialog), [1] cancel, [2] submit
    const submitButton = wrapper.findAll('button')[2];
    expect(submitButton.attributes('disabled')).toBeDefined();
  });

  it('calls createProject with trimmed value and navigates on valid submit', async () => {
    await wrapper.find('button').trigger('click');

    const input = wrapper.find('input[name="projectTitle"]');
    await input.setValue('  Valid Project  '); // Test trim functionality

    const form = wrapper.findComponent(Form);
    await form.trigger('submit');

    // Wait for validation and async operations to complete
    await new Promise(resolve => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    expect(projectService.createProject).toHaveBeenCalledWith('Valid Project'); // Should be trimmed
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

  it('closes the dialog on abort', async () => {
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(true);

    // buttons after opening: [0] add (outside dialog), [1] cancel, [2] submit
    const cancelButton = wrapper.findAll('button')[1];
    await cancelButton.trigger('click');

    expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(false);
  });
});
