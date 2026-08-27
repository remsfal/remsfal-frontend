import { computed, ref, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { FileUploadSelectEvent } from 'primevue/fileupload';

export interface UseTimelineEntriesOptions<T> {
  issueId: () => string;
  loadEntries: (issueId: string) => Promise<T[]>;
  sendMessage: (issueId: string, message: string | undefined, files: File[]) => Promise<void>;
  isBlocked?: (timelines: T[]) => boolean;
  createErrorToastDetail: string;
  loadErrorLogLabel?: string;
  createErrorLogLabel?: string;
}

export function useTimelineEntries<T>(options: UseTimelineEntriesOptions<T>): {
  loading: Ref<boolean>;
  error: Ref<boolean>;
  timelines: Ref<T[]>;
  messageText: Ref<string>;
  fileUploadKey: Ref<number>;
  sendingMessage: Ref<boolean>;
  canSendMessage: ComputedRef<boolean>;
  onFilesSelected: (event: FileUploadSelectEvent) => void;
  submitMessage: () => Promise<void>;
} {
  const { t } = useI18n();
  const toast = useToast();

  const loading = ref(false);
  const error = ref(false);
  const timelines = ref<T[]>([]) as Ref<T[]>;
  const messageText = ref('');
  const selectedFiles = ref<File[]>([]);
  const fileUploadKey = ref(0);
  const sendingMessage = ref(false);

  const isBlocked = computed(() => options.isBlocked?.(timelines.value) ?? false);

  const canSendMessage = computed(
    () => (messageText.value.trim().length > 0 || selectedFiles.value.length > 0) &&
      !sendingMessage.value &&
      !isBlocked.value,
  );

  const fetchTimelines = async () => {
    loading.value = true;
    error.value = false;
    try {
      timelines.value = await options.loadEntries(options.issueId());
    } catch (fetchError) {
      console.error(options.loadErrorLogLabel ?? 'Error fetching issue timeline:', fetchError);
      timelines.value = [];
      error.value = true;
    } finally {
      loading.value = false;
    }
  };

  const mergeSelectedFiles = (currentFiles: File[], newFiles: File[]) => {
    const uniqueFiles = new Map<string, File>();

    [...currentFiles, ...newFiles].forEach((file) => {
      const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
      uniqueFiles.set(fileKey, file);
    });

    return Array.from(uniqueFiles.values());
  };

  const onFilesSelected = (event: FileUploadSelectEvent) => {
    const files = Array.isArray(event.files) ? event.files : [];
    selectedFiles.value = mergeSelectedFiles(selectedFiles.value, files as File[]);
  };

  const submitMessage = async () => {
    const trimmedMessage = messageText.value.trim();
    const hasAttachments = selectedFiles.value.length > 0;
    if ((!trimmedMessage && !hasAttachments) || sendingMessage.value || isBlocked.value) { return; }

    sendingMessage.value = true;

    try {
      await options.sendMessage(options.issueId(), trimmedMessage || undefined, selectedFiles.value);
      messageText.value = '';
      selectedFiles.value = [];
      fileUploadKey.value += 1;
      await fetchTimelines();
    } catch (submitError) {
      console.error(options.createErrorLogLabel ?? 'Error creating timeline entry:', submitError);
      toast.add({
        severity: 'error',
        summary: t('error.general'),
        detail: t(options.createErrorToastDetail),
        life: 4000,
      });
    } finally {
      sendingMessage.value = false;
    }
  };

  watch(options.issueId, fetchTimelines, { immediate: true });

  return {
    loading,
    error,
    timelines,
    messageText,
    fileUploadKey,
    sendingMessage,
    canSendMessage,
    onFilesSelected,
    submitMessage,
  };
}
