import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import ProjectSettingsView from '../../src/views/ProjectSettingsView.vue';
import { projectService } from '../../src/services/ProjectService';

// ---- Mocks ----
const routerPushMock = vi.fn();
const addMock = vi.fn();

vi.mock('vue-router', () => ({useRouter: () => ({ push: routerPushMock }),}));

vi.mock('primevue/usetoast', () => ({useToast: () => ({add: addMock,}),}));

// ---- Test Suite ----
describe('ProjectSettingsView.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.spyOn(projectService, 'deleteProject').mockResolvedValue();

    wrapper = mount(ProjectSettingsView, {
      props: { projectId: 'test-project-id' },
      global: {
        stubs: {
          ProjectSettings: true,
          ProjectMemberSettings: true,
        },
      },
    });

    await flushPromises();
  });

  // ---- Component Rendering Tests ----
  test('renders ProjectSettings component with correct projectId', () => {
    const projectSettings = wrapper.findComponent({ name: 'ProjectSettings' });
    expect(projectSettings.exists()).toBe(true);
  });

  test('renders ProjectMemberSettings component with correct projectId', () => {
    const memberSettings = wrapper.findComponent({ name: 'ProjectMemberSettings' });
    expect(memberSettings.exists()).toBe(true);
  });

  // ---- Delete Project Tests ----
  test('delete dialog is initially hidden', () => {
    expect(wrapper.vm.showDeleteDialog).toBe(false);
  });

  test('shows delete confirmation dialog when delete button is clicked', async () => {
    const deleteButton = wrapper.findAll('button').find((btn) =>
      btn.text().includes('Liegenschaft löschen') || btn.text().includes('Delete'),
    );

    if (deleteButton) {
      await deleteButton.trigger('click');
      await flushPromises();
      expect(wrapper.vm.showDeleteDialog).toBe(true);
    }
  });

  test('successfully deletes project and redirects to projects page', async () => {
    vi.spyOn(projectService, 'deleteProject').mockResolvedValue();

    wrapper.vm.showDeleteDialog = true;
    await wrapper.vm.deleteProject();
    await flushPromises();

    expect(projectService.deleteProject).toHaveBeenCalledWith('test-project-id');
    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({severity: 'success',}),
    );
    expect(wrapper.vm.showDeleteDialog).toBe(false);
    expect(routerPushMock).toHaveBeenCalledWith('/projects');
  });

  test('shows error toast when project deletion fails', async () => {
    vi.spyOn(projectService, 'deleteProject').mockRejectedValue(new Error('Delete failed'));

    wrapper.vm.showDeleteDialog = true;
    await wrapper.vm.deleteProject();
    await flushPromises();

    expect(projectService.deleteProject).toHaveBeenCalledWith('test-project-id');
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  test('closes delete dialog when cancel button is clicked', async () => {
    wrapper.vm.showDeleteDialog = true;
    await flushPromises();

    // Set dialog to false (simulating cancel action)
    wrapper.vm.showDeleteDialog = false;
    await flushPromises();

    expect(wrapper.vm.showDeleteDialog).toBe(false);
  });
});
