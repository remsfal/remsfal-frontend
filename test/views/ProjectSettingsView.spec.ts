import { mount, flushPromises } from '@vue/test-utils';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import ProjectSettingsView from '@/views/ProjectSettingsView.vue';
import { projectService } from '@/services/ProjectService';
import { useToast } from 'primevue/usetoast';

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}));

describe('ProjectSettingsView.vue', () => {
  const mockToast = useToast();
  const mockProject = { title: 'Old Name' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(projectService, 'getProject').mockResolvedValue(mockProject);
    vi.spyOn(projectService, 'updateProject').mockResolvedValue({});
  });

  test('fetches and displays project name on mount', async () => {
    const wrapper = mount(ProjectSettingsView, {
      props: { projectId: 'abc123' },
    });

    await flushPromises();
    expect(projectService.getProject).toHaveBeenCalledWith('abc123');
    expect(wrapper.vm.projectName).toBe('Old Name');
  });

  test('enables save button when name changes', async () => {
    const wrapper = mount(ProjectSettingsView, {
      props: { projectId: 'abc123' },
    });

    await flushPromises();
    await wrapper.setData({ projectName: 'New Name' });

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeUndefined();
  });

  test('calls updateProject and shows success toast on save', async () => {
    const wrapper = mount(ProjectSettingsView, {
      props: { projectId: 'abc123' },
    });

    await flushPromises();
    wrapper.vm.projectName = 'Updated Project';
    await wrapper.vm.saveProjectName();

    expect(projectService.updateProject).toHaveBeenCalledWith('abc123', {
      title: 'Updated Project',
    });
    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  test('shows error toast on update failure', async () => {
    vi.spyOn(projectService, 'updateProject').mockRejectedValue(new Error('fail'));
    const wrapper = mount(ProjectSettingsView, { props: { projectId: 'abc123' } });
    await flushPromises();
    wrapper.vm.projectName = 'Broken';
    await wrapper.vm.saveProjectName();

    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
  });

  test('reacts to projectId change', async () => {
    const wrapper = mount(ProjectSettingsView, { props: { projectId: 'id1' } });
    await flushPromises();
    await wrapper.setProps({ projectId: 'id2' });
    await flushPromises();

    expect(projectService.getProject).toHaveBeenCalledWith('id2');
  });
});
