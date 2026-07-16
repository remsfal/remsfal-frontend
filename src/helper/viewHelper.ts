import type { ToastServiceMethods } from 'primevue/toastservice';

export function showSavingErrorToast(toast: ToastServiceMethods, detail: string, err?: unknown) {
  toast.add({
    severity: 'error',
    summary: 'Speicherfehler',
    detail: err ? `${detail}\n${String(err)}` : detail,
    life: 6000,
  });
}
