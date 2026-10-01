import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';

/** Shared toast display durations (ms), replacing ad-hoc per-call-site values. */
export const TOAST_LIFE = {
  success: 3000,
  warn: 4000,
  error: 4000,
} as const;

export type AppToastSeverity = keyof typeof TOAST_LIFE;

export interface AppToastOptions {
  /** Overrides the default summary for this severity. Pass an already-resolved (t()'d) string. */
  summary?: string;
}

export function useAppToast() {
  const toast = useToast();
  const { t } = useI18n();

  function show(severity: AppToastSeverity, detail: string, options?: AppToastOptions) {
    toast.add({
      severity,
      summary: options?.summary ?? (severity === 'error' ? t('error.general') : t(`toast.${severity}Summary`)),
      detail,
      life: TOAST_LIFE[severity],
    });
  }

  return {
    success: (detail: string, options?: AppToastOptions) => show('success', detail, options),
    warn: (detail: string, options?: AppToastOptions) => show('warn', detail, options),
    error: (detail: string, options?: AppToastOptions) => show('error', detail, options),
  };
}
