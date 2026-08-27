import { computed, onMounted, ref, watch, type Ref, type WatchSource } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { FileUploadSelectEvent } from 'primevue/fileupload';
import type { components as ticketingComponents } from '@/services/api/ticketing-schema';

export type TimelineJson = ticketingComponents['schemas']['TimelineJson'];

type TimelinePurpose = NonNullable<TimelineJson['purpose']>;

export interface TimelineSendPayload {
  purpose: TimelinePurpose;
  message?: string;
}

export interface UseTimelineOptions {
  load: () => Promise<TimelineJson[]>;
  send: (payload: TimelineSendPayload, files: File[]) => Promise<void>;
  watchSource?: WatchSource;
  sendPurpose?: TimelinePurpose;
  isBlocked?: (items: TimelineJson[]) => boolean;
  sendErrorMessage: string;
  loadErrorLogLabel?: string;
  sendErrorLogLabel?: string;
}

export function useTimeline(options: UseTimelineOptions) {
  const { t } = useI18n();
  const toast = useToast();

  const loading = ref(false);
  const error = ref(false);
  const items = ref([]) as Ref<TimelineJson[]>;
  const messageText = ref('');
  const selectedFiles = ref<File[]>([]);
  const fileUploadKey = ref(0);
  const sending = ref(false);

  const canSubmit = computed(
    () =>
      (messageText.value.trim().length > 0 || selectedFiles.value.length > 0) &&
      !sending.value &&
      !(options.isBlocked?.(items.value) ?? false),
  );

  const fetchItems = async () => {
    loading.value = true;
    error.value = false;
    try {
      items.value = await options.load();
    } catch (fetchError) {
      console.error(options.loadErrorLogLabel ?? 'Failed to load timeline', fetchError);
      items.value = [];
      error.value = true;
    } finally {
      loading.value = false;
    }
  };

  const mergeSelectedFiles = (currentFiles: File[], newFiles: File[]) => {
    const uniqueFiles = new Map<string, File>();
    [...currentFiles, ...newFiles].forEach((file) => {
      uniqueFiles.set(`${file.name}-${file.size}-${file.lastModified}`, file);
    });
    return Array.from(uniqueFiles.values());
  };

  const onFilesSelected = (event: FileUploadSelectEvent) => {
    const files = Array.isArray(event.files) ? event.files : [];
    selectedFiles.value = mergeSelectedFiles(selectedFiles.value, files as File[]);
  };

  const submit = async () => {
    if (!canSubmit.value) return;
    const trimmedMessage = messageText.value.trim();
    sending.value = true;
    try {
      await options.send(
        {
          purpose: options.sendPurpose ?? 'MESSAGE_SENT',
          ...(trimmedMessage ? { message: trimmedMessage } : {}),
        },
        selectedFiles.value,
      );
      messageText.value = '';
      selectedFiles.value = [];
      fileUploadKey.value += 1;
      await fetchItems();
    } catch (sendError) {
      console.error(options.sendErrorLogLabel ?? 'Failed to create timeline entry', sendError);
      toast.add({
        severity: 'error',
        summary: t('error.general'),
        detail: options.sendErrorMessage,
        life: 4000,
      });
    } finally {
      sending.value = false;
    }
  };

  onMounted(fetchItems);
  if (options.watchSource) {
    watch(options.watchSource, fetchItems);
  }

  return {
    loading,
    error,
    items,
    messageText,
    selectedFiles,
    fileUploadKey,
    sending,
    canSubmit,
    onFilesSelected,
    submit,
  };
}
