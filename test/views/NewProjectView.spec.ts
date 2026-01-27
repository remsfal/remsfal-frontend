import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewProjectForm from '../../src/components/NewProjectForm.vue';
import router from '../../src/router';
import { saveProject } from '../../src/helper/indexeddb';
import { projectService } from '../../src/services/ProjectService';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { Form } from '@primevue/forms';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';

vi.mock('@/helper/indexeddb', () => ({saveProject: vi.fn(),}));

vi.mock('@/services/ProjectService', () => ({projectService: { createProject: vi.fn() },}));

const mockAddProjectToList = vi.fn();
const mockSetSelectedProject = vi.fn();
vi.mock('@/stores/ProjectStore', () => ({
  useProjectStore: vi.fn(() => ({
    addProjectToList: mockAddProjectToList,
    setSelectedProject: mockSetSelectedProject,
  })),
}));

describe('NewProjectForm.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());

    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });

    wrapper = mount(NewProjectForm, {
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          Button: {
            template: `
              <button type="button" :label="label" :icon="icon" :severity="severity" @click="$emit('click')">
                {{ label }}
              </button>
            `,
            props: ['label', 'icon', 'severity'],
          },
        },
        components: {
          Form,
          InputText,
          Message,
        },
        mocks: {
          $t: (msg: string, params?: any) => {
            if (msg === 'newProjectForm.title.error')
              return `Der Name der Liegenschaft darf nicht mehr als ${params.maxLength} Zeichen lang sein`;
            if (msg === 'newProjectForm.title.required')
              return 'Bitte geben Sie einen Namen ein';
            if (msg === 'button.cancel') return 'Abbrechen';
            if (msg === 'button.create') return 'Erstellen';
            return msg;
          },
        },
      },
    });
  });

  afterEach(() => {
    delete (window.navigator as any).onLine;
  });

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(true);
  });

  it('shows error for title exceeding max length', async () => {
    const input = wrapper.find('input[name="projectTitle"]');
    const longTitle = 'A'.repeat(101);
    await input.setValue(longTitle);
    await input.trigger('blur');

    await new Promise(resolve => setTimeout(resolve, 50));
    await nextTick();

    const errorMessage = wrapper.findComponent(Message);
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toContain('100');
  });

  it('handles cancel (abort) correctly', async () => {
    const mockRouterPush = vi.spyOn(router, 'push').mockResolvedValue();
    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Abbrechen');
    await cancelBtn!.trigger('click');
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'ProjectSelection' });
  });

  it('saves project offline when navigator is offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false });
    const input = wrapper.find('input[name="projectTitle"]');
    await input.setValue('Offline Project');

    const form = wrapper.findComponent(Form);
    await form.trigger('submit');

    await new Promise(resolve => setTimeout(resolve, 50));
    await nextTick();

    expect(saveProject).toHaveBeenCalledWith('Offline Project');
  });

  it('creates project online and updates store', async () => {
    vi.mocked(projectService.createProject).mockResolvedValue({ id: '1', title: 'Online Project' });
    const mockRouterPush = vi.spyOn(router, 'push').mockResolvedValue();
    const input = wrapper.find('input[name="projectTitle"]');
    await input.setValue('Online Project');

    const form = wrapper.findComponent(Form);
    await form.trigger('submit');

    await new Promise(resolve => setTimeout(resolve, 50));
    await nextTick();

    expect(projectService.createProject).toHaveBeenCalledWith('Online Project');
    expect(mockAddProjectToList).toHaveBeenCalledWith({
      id: '1',
      name: 'Online Project',
      memberRole: 'MANAGER'
    });
    expect(mockSetSelectedProject).toHaveBeenCalledWith({
      id: '1',
      name: 'Online Project',
      memberRole: 'MANAGER'
    });
    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'ProjectDashboard',
      params: { projectId: '1' },
    });
  });

  it('handles API error by saving project offline', async () => {
    vi.mocked(projectService.createProject).mockRejectedValue(new Error('Network error'));
    const input = wrapper.find('input[name="projectTitle"]');
    await input.setValue('Error Project');

    const form = wrapper.findComponent(Form);
    await form.trigger('submit');

    await new Promise(resolve => setTimeout(resolve, 50));
    await nextTick();

    expect(saveProject).toHaveBeenCalledWith('Error Project');
  });
});
