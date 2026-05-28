import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import ProjectDangerZoneCard from '@/components/ProjectDangerZoneCard.vue';
import { projectService } from '@/services/ProjectService';

// ---- Mocks ----
const routerPushMock = vi.fn();
const addMock = vi.fn();

vi.mock('vue-router', () => ({ useRouter: () => ({ push: routerPushMock }) }));

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// ---- Helpers ----
const findButtonByText = (text: string): HTMLButtonElement | null => {
  const buttons = Array.from(document.querySelectorAll('button'));
  return (buttons.find((btn) => btn.textContent?.trim().includes(text)) as HTMLButtonElement) ?? null;
};

// ---- Test Suite ----
describe('ProjectDangerZoneCard.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof ProjectDangerZoneCard>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.spyOn(projectService, 'deleteProject').mockResolvedValue();

    wrapper = mount(ProjectDangerZoneCard, {
      props: { projectId: 'test-project-id' },
      attachTo: document.body,
    });

    await flushPromises();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('dialog is initially hidden', () => {
    const dialog = document.querySelector('.p-dialog');
    expect(dialog).toBeNull();
  });

  test('opens delete confirmation dialog when delete button is clicked', async () => {
    const deleteButton = findButtonByText('Liegenschaft löschen');
    expect(deleteButton).not.toBeNull();

    deleteButton!.click();
    await flushPromises();

    const dialog = document.querySelector('.p-dialog');
    expect(dialog).not.toBeNull();
  });

  test('successfully deletes project and redirects to projects page', async () => {
    // Open dialog
    findButtonByText('Liegenschaft löschen')!.click();
    await flushPromises();

    // Click confirm delete
    const confirmButton = findButtonByText('Endgültig löschen');
    expect(confirmButton).not.toBeNull();
    confirmButton!.click();
    await flushPromises();

    expect(projectService.deleteProject).toHaveBeenCalledWith('test-project-id');
    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
    expect(routerPushMock).toHaveBeenCalledWith('/projects');
  });

  test('shows error toast when project deletion fails', async () => {
    vi.spyOn(projectService, 'deleteProject').mockRejectedValue(new Error('Delete failed'));

    findButtonByText('Liegenschaft löschen')!.click();
    await flushPromises();

    const confirmButton = findButtonByText('Endgültig löschen');
    expect(confirmButton).not.toBeNull();
    confirmButton!.click();
    await flushPromises();

    expect(projectService.deleteProject).toHaveBeenCalledWith('test-project-id');
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  test('closes delete dialog when cancel button is clicked', async () => {
    findButtonByText('Liegenschaft löschen')!.click();
    await flushPromises();

    expect(document.querySelector('.p-dialog')).not.toBeNull();

    const cancelButton = findButtonByText('Abbrechen');
    expect(cancelButton).not.toBeNull();
    cancelButton!.click();
    await flushPromises();

    expect(document.querySelector('.p-dialog')).toBeNull();
  });
});
