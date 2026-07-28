import { describe, it, expect, vi } from 'vitest';
import { showSavingErrorToast } from '@/helper/viewHelper';
import type { ToastServiceMethods } from 'primevue/toastservice';

describe('viewHelper', () => {
  describe('showSavingErrorToast', () => {
    it('shows an error toast without appending err when err is not provided', () => {
      const toast = { add: vi.fn() } as unknown as ToastServiceMethods;

      showSavingErrorToast(toast, 'Etwas ist schiefgelaufen');

      expect(toast.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Speicherfehler',
        detail: 'Etwas ist schiefgelaufen',
        life: 6000,
      });
    });

    it('appends the stringified err to detail when err is an Error instance', () => {
      const toast = { add: vi.fn() } as unknown as ToastServiceMethods;

      showSavingErrorToast(toast, 'Etwas ist schiefgelaufen', new Error('boom'));

      expect(toast.add).toHaveBeenCalledWith(
        expect.objectContaining({detail: 'Etwas ist schiefgelaufen\nError: boom',}),
      );
    });

    it('appends the stringified err to detail when err is a plain string', () => {
      const toast = { add: vi.fn() } as unknown as ToastServiceMethods;

      showSavingErrorToast(toast, 'Etwas ist schiefgelaufen', 'network timeout');

      expect(toast.add).toHaveBeenCalledWith(
        expect.objectContaining({detail: 'Etwas ist schiefgelaufen\nnetwork timeout',}),
      );
    });
  });
});
