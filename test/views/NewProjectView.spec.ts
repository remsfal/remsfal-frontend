import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewProjectForm from '../../src/components/NewProjectForm.vue';
import router from '../../src/router';
import { saveProject } from '../../src/helper/indexeddb';
import { projectService } from '../../src/services/ProjectService';
import { useProjectStore } from '../../src/stores/ProjectStore';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';

// Mock services
vi.mock('@/helper/indexeddb', () => ({
  saveProject: vi.fn(),
}));

vi.mock('@/services/ProjectService');
vi.mock('@/stores/ProjectStore', () => ({
  useProjectStore: vi.fn(() => ({
    searchSelectedProject: vi.fn(),
  })),
}));

describe('NewProjectForm', () => {
  let wrapper: VueWrapper<any>;
  let projectStoreMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    projectStoreMock = useProjectStore();

    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });

    wrapper = mount(NewProjectForm, {
      global: {
        stubs: {
          Dialog: false,
          InputText: false,
          Button: false,
        },
      },
    });
  });

  afterEach(() => {
    delete (window.navigator as any).onLine;
  });

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('input#projectTitle').exists()).toBe(true);
  });

  it('updates v-model correctly', async () => {
    const input = wrapper.find('input#projectTitle');
    await input.setValue('Test Project');
    expect((input.element as HTMLInputElement).value).toBe('Test Project');
  });

  it('shows error for project title exceeding max length', async () => {
    const input = wrapper.find('input#projectTitle');
    const longTitle = 'A'.repeat(101);
    await input.setValue(longTitle);
    await nextTick();

    const errorMessage = wrapper.find('small.p-error');
    expect(errorMessage.text()).toContain('darf nicht mehr als 100 Zeichen lang sein');
  });

  it('handles abort correctly', async () => {
    const mockRouterPush = vi.spyOn(router, 'push').mockResolvedValue();
    const cancelButton = wrapper.find('button[severity="secondary"]');
    await cancelButton.trigger('click');
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'ProjectSelection' });
  });

  it('saves project offline when navigator is offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false });

    const input = wrapper.find('input#projectTitle');
    await input.setValue('Offline Project');

    const createButton = wrapper.find('button[icon="pi pi-plus"]');
    await createButton.trigger('click');

    expect(saveProject).toHaveBeenCalledWith('Offline Project');
  });

  it('creates project online and updates store', async () => {
    vi.mocked(projectService.createProject).mockResolvedValue({ id: '1', title: 'Online Project' });
    const mockRouterPush = vi.spyOn(router, 'push').mockResolvedValue();

    const input = wrapper.find('input#projectTitle');
    await input.setValue('Online Project');

    const createButton = wrapper.find('button[icon="pi pi-plus"]');
    await createButton.trigger('click');

    expect(projectService.createProject).toHaveBeenCalledWith('Online Project');
    expect(projectStoreMock.searchSelectedProject).toHaveBeenCalledWith('1');
    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'ProjectDashboard',
      params: { projectId: '1' },
    });
  });

  it('handles API error by saving project offline', async () => {
    vi.mocked(projectService.createProject).mockRejectedValue(new Error('Network error'));

    const input = wrapper.find('input#projectTitle');
    await input.setValue('Error Project');

    const createButton = wrapper.find('button[icon="pi pi-plus"]');
    await createButton.trigger('click');

    expect(saveProject).toHaveBeenCalledWith('Error Project');
  });
});
