import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import ProjectSettings from '@/components/ProjectSettings.vue';
import { projectService } from '@/services/ProjectService';

// ---- Mocks ----
const addMock = vi.fn();

vi.mock('primevue/usetoast', () => ({useToast: () => ({add: addMock,}),}));

// ---- Test Suite ----
describe('ProjectSettings.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.spyOn(projectService, 'getProject').mockResolvedValue({ title: 'Old Project' });
    vi.spyOn(projectService, 'updateProject').mockResolvedValue({});

    wrapper = mount(ProjectSettings, {props: { projectId: 'test-project-id' },});

    await flushPromises();
  });

  test('fetches and displays project name on mount', async () => {
    expect(projectService.getProject).toHaveBeenCalledWith('test-project-id');
    expect(wrapper.vm.projectName).toBe('Old Project');
  });

  test('displays the correct title', () => {
    const title = wrapper.find('.font-semibold.text-xl');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Liegenschaftseinstellungen');
  });

  test('renders input field with project name', async () => {
    const input = wrapper.find('input[type="text"]');
    expect(input.exists()).toBe(true);
    expect((input.element as HTMLInputElement).value).toBe('Old Project');
  });

  test('save button is disabled when name has not changed', async () => {
    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
  });

  test('enables save button when project name changes', async () => {
    wrapper.vm.projectName = 'Updated Project';
    await flushPromises();

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeUndefined();
  });

  test('disables save button when project name is empty', async () => {
    wrapper.vm.projectName = '';
    await flushPromises();

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
  });

  test('disables save button when project name is only whitespace', async () => {
    wrapper.vm.projectName = '   ';
    await flushPromises();

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
  });

  test('calls updateProject and shows success toast on save', async () => {
    wrapper.vm.originalProjectName = 'Old Project';
    wrapper.vm.projectName = 'Updated Project';

    await wrapper.vm.saveProjectName();
    await flushPromises();

    expect(projectService.updateProject).toHaveBeenCalledWith('test-project-id', {title: 'Updated Project',});
    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: expect.any(String),
        detail: expect.any(String),
      }),
    );
  });

  test('trims whitespace when saving project name', async () => {
    wrapper.vm.originalProjectName = 'Old Project';
    wrapper.vm.projectName = '  Updated Project  ';

    await wrapper.vm.saveProjectName();
    await flushPromises();

    expect(projectService.updateProject).toHaveBeenCalledWith('test-project-id', {title: 'Updated Project',});
  });

  test('shows error toast on update failure', async () => {
    vi.spyOn(projectService, 'updateProject').mockRejectedValue(new Error('fail'));

    wrapper.vm.originalProjectName = 'Old Project';
    wrapper.vm.projectName = 'Broken Project';

    await wrapper.vm.saveProjectName();
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: expect.any(String),
        detail: expect.any(String),
      }),
    );
  });

  test('shows loading state during save', async () => {
    wrapper.vm.originalProjectName = 'Old Project';
    wrapper.vm.projectName = 'Updated Project';

    const savePromise = wrapper.vm.saveProjectName();
    expect(wrapper.vm.loading).toBe(true);

    await savePromise;
    await flushPromises();

    expect(wrapper.vm.loading).toBe(false);
  });

  test('updates originalProjectName after successful save', async () => {
    wrapper.vm.originalProjectName = 'Old Project';
    wrapper.vm.projectName = 'Updated Project';

    await wrapper.vm.saveProjectName();
    await flushPromises();

    expect(wrapper.vm.originalProjectName).toBe('Updated Project');
  });

  test('fetches project data when projectId prop changes', async () => {
    vi.clearAllMocks();
    vi.spyOn(projectService, 'getProject').mockResolvedValue({ title: 'New Project' });

    await wrapper.setProps({ projectId: 'new-project-id' });
    await flushPromises();

    expect(projectService.getProject).toHaveBeenCalledWith('new-project-id');
    expect(wrapper.vm.projectName).toBe('New Project');
  });

  test('does not call updateProject if name has not changed', async () => {
    wrapper.vm.originalProjectName = 'Old Project';
    wrapper.vm.projectName = 'Old Project';

    await wrapper.vm.saveProjectName();

    expect(projectService.updateProject).not.toHaveBeenCalled();
  });
});
