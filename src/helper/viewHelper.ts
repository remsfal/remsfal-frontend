import type { ToastServiceMethods } from 'primevue/toastservice';
import type { Router } from 'vue-router';
import type { Ref } from 'vue';

export function showSavingErrorToast(toast: ToastServiceMethods, detail: string, err?: unknown) {
  toast.add({
    severity: 'error',
    summary: 'Speicherfehler',
    detail: err ? `${detail}\n${String(err)}` : detail,
    life: 6000,
  });
}

export function showValidationErrorToast(toast: ToastServiceMethods, details: string[]) {
  toast.add({
    severity: 'error',
    summary: 'Validierungsfehler',
    detail: details.join('\n'),
    life: 6000,
  });
}

export function navigateToObjects(router: Router, projectId: string) {
  router.push(`/project/${projectId}/objects`);
}

export function handleCancel(hasChanges: Ref<boolean>, router: Router, projectId: string) {
  if (hasChanges.value) {
    const confirmLeave = confirm(
      'Es gibt ungespeicherte Änderungen. Möchten Sie die Seite wirklich verlassen?',
    );
    if (!confirmLeave) return;
  }
  if (window.opener) {
    window.close();
  }
  else {
    navigateToObjects(router, projectId);
  }
}
