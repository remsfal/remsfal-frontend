import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import ProjectSettingsCard from '@/features/project/settings/components/ProjectSettingsCard.vue';
import { projectService, type ProjectJson } from '@/services/ProjectService';

// ---- Mocks ----
const addMock = vi.fn();

vi.mock('primevue/usetoast', () => ({useToast: () => ({add: addMock,}),}));

// ---- Test Suite ----
describe('ProjectSettingsCard.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof ProjectSettingsCard>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.spyOn(projectService, 'getProject').mockResolvedValue({ title: 'Old Project' });
    vi.spyOn(projectService, 'updateProject').mockResolvedValue({ title: 'Old Project' });

    wrapper = mount(ProjectSettingsCard, {props: { projectId: 'test-project-id' },});

    await flushPromises();
  });

  test('displays the correct title', () => {
    const title = wrapper.find('.font-semibold.text-xl');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Liegenschaftseinstellungen');
  });

  test('renders input field with project name', async () => {
    const input = wrapper.find<HTMLInputElement>('#name');
    expect(input.exists()).toBe(true);
    expect(input.element.value).toBe('Old Project');
  });

  test('save button is disabled when name has not changed', async () => {
    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
  });

  test('enables save button when project name changes', async () => {
    await wrapper.find('#name').setValue('Updated Project');

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeUndefined();
  });

  test('disables save button when project name is empty', async () => {
    await wrapper.find('#name').setValue('');

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
  });

  test('disables save button when project name is only whitespace', async () => {
    await wrapper.find('#name').setValue('   ');

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
  });

  test('calls updateProject and shows success toast on save', async () => {
    await wrapper.find('#name').setValue('Updated Project');

    await wrapper.find('button').trigger('click');
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
    await wrapper.find('#name').setValue('  Updated Project  ');

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(projectService.updateProject).toHaveBeenCalledWith('test-project-id', {title: 'Updated Project',});
  });

  test('shows error toast on update failure', async () => {
    vi.spyOn(projectService, 'updateProject').mockRejectedValue(new Error('fail'));

    await wrapper.find('#name').setValue('Broken Project');

    await wrapper.find('button').trigger('click');
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
    let resolveUpdate!: (value: ProjectJson) => void;
    vi.spyOn(projectService, 'updateProject').mockImplementationOnce(
      () => new Promise<ProjectJson>((resolve) => { resolveUpdate = resolve; }),
    );

    await wrapper.find('#name').setValue('Updated Project');
    const button = wrapper.find('button');

    const clickPromise = button.trigger('click');
    await nextTick();

    expect(button.attributes('disabled')).toBeDefined();
    expect(button.classes()).toContain('p-button-loading');

    resolveUpdate({ title: 'Updated Project' });
    await clickPromise;
    await flushPromises();

    expect(button.classes()).not.toContain('p-button-loading');
  });

  test('updates originalProjectName after successful save', async () => {
    await wrapper.find('#name').setValue('Updated Project');

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  test('fetches project data when projectId prop changes', async () => {
    vi.clearAllMocks();
    vi.spyOn(projectService, 'getProject').mockResolvedValue({ title: 'New Project' });

    await wrapper.setProps({ projectId: 'new-project-id' });
    await flushPromises();

    expect(projectService.getProject).toHaveBeenCalledWith('new-project-id');
    expect(wrapper.find<HTMLInputElement>('#name').element.value).toBe('New Project');
  });
});
