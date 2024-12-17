import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewProjectView from '@/views/NewProjectView.vue';
import PrimeVue from 'primevue/config';
import router from '../../src/router';

vi.mock('@/helper/indexeddb', () => ({
  saveProject: vi.fn(),
}));

vi.mock('@/services/ProjectService', () => ({
  default: vi.fn().mockImplementation(() => ({
    createProject: vi.fn(() => Promise.resolve({ id: 1, title: 'Test Project' })),
  })),
}));

describe('NewProjectView', () => {
  let wrapper: VueWrapper<NewProjectView>;
  const mockRouterPush = vi.spyOn(router, 'push').mockResolvedValue();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock navigator.onLine to simulate online status
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });

    wrapper = mount(NewProjectView, {
      global: {
        plugins: [PrimeVue, router],
        stubs: {
          NewProjectForm: false, // Disable the child component mock
        },
      },
    });
  });

  afterEach(() => {
    // Restore the original navigator.onLine value after tests
    delete (window.navigator as any).onLine;
  });

  it('renders NewProjectView properly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the input field for project title', () => {
    const input = wrapper.find('input#value');
    expect(input.exists()).toBe(true);
  });

  it('handles input value changes correctly', async () => {
    const input = wrapper.find('input#value');
    expect(input.exists()).toBe(true);

    // Set input value and check binding with v-model
    await input.setValue('New Project Title');
    expect(input.element.value).toBe('New Project Title');
  });

  it('displays an error message when project title exceeds max length', async () => {
    const input = wrapper.find('input#value');
    expect(input.exists()).toBe(true);

    const longTitle = 'A'.repeat(101); // Title exceeds max length
    await input.setValue(longTitle);

    const errorMessage = wrapper.find('small.p-error');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toContain('darf nicht mehr als 100 Zeichen lang sein');
  });

  it('handles the abort function and navigates to ProjectSelection', async () => {
    const abortButton = wrapper.find('button[type="reset"]');
    expect(abortButton.exists()).toBe(true);

    await abortButton.trigger('click');

    // Ensure navigation to ProjectSelection
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'ProjectSelection' });
  });
});
