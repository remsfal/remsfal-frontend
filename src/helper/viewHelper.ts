export function showSavingErrorToast(toast, detail: string) {
  toast.add({
    severity: 'error',
    summary: 'Speicherfehler',
    detail,
    life: 6000,
  });
}

export function showValidationErrorToast(toast, details: string[]) {
  toast.add({
    severity: 'error',
    summary: 'Validierungsfehler',
    detail: details.join('\n'),
    life: 6000,
  });
}

export function navigateToObjects(router, projectId: string) {
  router.push(`/project/${projectId}/objects`);
}

export function handleCancel(hasChanges, router, projectId) {
  if (hasChanges.value) {
    const confirmLeave = confirm(
      'Es gibt ungespeicherte Änderungen. Möchten Sie die Seite wirklich verlassen?',
    );
    if (!confirmLeave) return;
  }
  if (window.opener) {
    window.close();
  } else {
    navigateToObjects(router, projectId);
  }
}