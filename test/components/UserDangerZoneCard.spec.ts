import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import UserDangerZoneCard from '@/components/UserDangerZoneCard.vue';
import { userService } from '@/services/UserService';

// ---- Mocks ----
const addMock = vi.fn();

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// ---- Helpers ----
const findButtonByText = (text: string): HTMLButtonElement | null => {
  const buttons = Array.from(document.querySelectorAll('button'));
  return (buttons.find((btn) => btn.textContent?.trim().includes(text)) as HTMLButtonElement) ?? null;
};

// ---- Test Suite ----
describe('UserDangerZoneCard.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof UserDangerZoneCard>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.spyOn(userService, 'deleteUser').mockResolvedValue();

    Object.defineProperty(window, 'location', { value: { pathname: '' }, writable: true });

    wrapper = mount(UserDangerZoneCard, { attachTo: document.body });

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
    const deleteButton = findButtonByText('Konto löschen');
    expect(deleteButton).not.toBeNull();

    deleteButton!.click();
    await flushPromises();

    const dialog = document.querySelector('.p-dialog');
    expect(dialog).not.toBeNull();
  });

  test('successfully deletes account and redirects to logout', async () => {
    // Open dialog
    findButtonByText('Konto löschen')!.click();
    await flushPromises();

    // Click confirm delete
    const confirmButton = findButtonByText('Endgültig löschen');
    expect(confirmButton).not.toBeNull();
    confirmButton!.click();
    await flushPromises();

    expect(userService.deleteUser).toHaveBeenCalled();
    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
    expect(window.location.pathname).toBe('/api/v1/authentication/logout');
  });

  test('shows error toast when account deletion fails', async () => {
    vi.spyOn(userService, 'deleteUser').mockRejectedValue(new Error('Delete failed'));

    findButtonByText('Konto löschen')!.click();
    await flushPromises();

    const confirmButton = findButtonByText('Endgültig löschen');
    expect(confirmButton).not.toBeNull();
    confirmButton!.click();
    await flushPromises();

    expect(userService.deleteUser).toHaveBeenCalled();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  test('closes delete dialog when cancel button is clicked', async () => {
    findButtonByText('Konto löschen')!.click();
    await flushPromises();

    expect(document.querySelector('.p-dialog')).not.toBeNull();

    const cancelButton = findButtonByText('Abbrechen');
    expect(cancelButton).not.toBeNull();
    cancelButton!.click();
    await flushPromises();

    expect(document.querySelector('.p-dialog')).toBeNull();
  });
});
