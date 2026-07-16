<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import type { FileUploadSelectEvent } from 'primevue/fileupload';
import Image from 'primevue/image';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Textarea from 'primevue/textarea';
import Timeline from 'primevue/timeline';
import BaseCard from '@/components/common/BaseCard.vue';
import { tenantTimelineService, type TenantTimelineJson } from '@/services/TenantTimelineService';

const props = defineProps<{ issueId: string; }>();

const { t, locale } = useI18n();
const toast = useToast();

const loading = ref(false);
const error = ref(false);
const timelines = ref<TenantTimelineJson[]>([]);
const messageText = ref('');
const selectedFiles = ref<File[]>([]);
const fileUploadKey = ref(0);
const sendingMessage = ref(false);
const blockingStatusMessages = new Set(['CLOSED', 'REJECTED']);
const isClosedByTimeline = computed(() => {
  return timelines.value.some((timeline) => {
    const normalizedMessage = timeline.message?.trim().toUpperCase();
    return normalizedMessage ? blockingStatusMessages.has(normalizedMessage) : false;
  });
});
const canSendMessage = computed(
  () => (messageText.value.trim().length > 0 || selectedFiles.value.length > 0) &&
    !sendingMessage.value &&
    !isClosedByTimeline.value,
);

interface TimelineAttachmentView {
  attachmentId: string;
  contentType?: string;
  downloadUrl: string;
  fileName?: string;
}

const imageFileExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']);

const isImageAttachment = (attachment: TimelineAttachmentView) => {
  if (attachment.contentType?.startsWith('image/')) {
    return true;
  }

  const fileName = attachment.fileName?.trim().toLowerCase();
  if (!fileName || !fileName.includes('.')) {
    return false;
  }

  const extension = fileName.split('.').pop();
  return extension ? imageFileExtensions.has(extension) : false;
};

const getTimelineAttachments = (timeline: TenantTimelineJson): TimelineAttachmentView[] => {
  return (timeline.attachments ?? []).flatMap((attachment) => {
    const attachmentId = attachment.attachmentId;
    if (!attachmentId) {
      return [];
    }

    const fileName = attachment.fileName;

    return [{
      attachmentId,
      contentType: attachment.contentType,
      downloadUrl: getTimelineAttachmentDownloadUrl(props.issueId, attachmentId, fileName),
      fileName,
    }];
  });
};

const getTimelineImageAttachments = (timeline: TenantTimelineJson) => {
  return getTimelineAttachments(timeline).filter(isImageAttachment);
};

const getTimelineNonImageAttachments = (timeline: TenantTimelineJson) => {
  return getTimelineAttachments(timeline).filter((attachment) => !isImageAttachment(attachment));
};

const getAttachmentTypeLabel = (attachment: TimelineAttachmentView) => {
  const fileName = attachment.fileName?.trim().toLowerCase();
  if (!fileName || !fileName.includes('.')) {
    return 'FILE';
  }

  const extension = fileName.split('.').pop();
  return extension ? extension.toUpperCase() : 'FILE';
};

const openAttachmentDownload = (downloadUrl: string) => {
  window.open(downloadUrl, '_blank', 'noopener,noreferrer');
};

const formatTimelineDate = (value?: string) => {
  if (!value) { return null; }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) { return value; }
  return date.toLocaleString(locale.value);
};

const getTimelineTitle = (purpose?: TenantTimelineJson['purpose']) => {
  switch (purpose) {
    case 'ISSUE_CREATED':
      return t('tenantIssues.timeline.issueCreatedTitle');
    case 'MESSAGE_SENT':
      return t('tenantIssues.timeline.tenantMessageTitle');
    case 'APPOINTMENT_REQUESTED':
      return t('tenantIssues.timeline.appointmentRequestedTitle');
    case 'APPOINTMENT_SCHEDULED':
      return t('tenantIssues.timeline.appointmentScheduledTitle');
    case 'STATUS_CHANGED':
      return t('tenantIssues.timeline.statusChangedTitle');
    default:
      return t('tenantIssues.timeline.entryFallbackTitle');
  }
};

const fetchTimelines = async () => {
  loading.value = true;
  error.value = false;
  try {
    const timelineResponse = await tenantTimelineService.getTimelineEntries(props.issueId);
    timelines.value = timelineResponse.timelines;
  } catch (fetchError) {
    console.error('Error fetching issue timeline:', fetchError);
    timelines.value = [];
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const getTimelineAttachmentCount = (timeline: TenantTimelineJson) => getTimelineAttachments(timeline).length;

const getTimelineAttachmentDownloadUrl = ( issueId: string, attachmentId: string, fileName?: string, ) => {
  const encodedIssueId = encodeURIComponent(issueId);
  const encodedAttachmentId = encodeURIComponent(attachmentId);
  const encodedFileName = encodeURIComponent(fileName || attachmentId);
  return `/ticketing/v1/tenant-relations/issues/${encodedIssueId}/attachments/${encodedAttachmentId}/${encodedFileName}`;
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
  if ((!trimmedMessage && !hasAttachments) || sendingMessage.value || isClosedByTimeline.value) { return; }

  sendingMessage.value = true;

  try {
    await tenantTimelineService.createTimelineEntryWithAttachments(props.issueId, {
      purpose: 'MESSAGE_SENT',
      ...(trimmedMessage ? { message: trimmedMessage } : {}),
    }, selectedFiles.value);
    messageText.value = '';
    selectedFiles.value = [];
    fileUploadKey.value += 1;
    await fetchTimelines();
  } catch (submitError) {
    console.error('Error creating timeline entry:', submitError);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('tenantIssues.timeline.createError'),
      life: 4000,
    });
  } finally {
    sendingMessage.value = false;
  }
};

onMounted(() => {
  fetchTimelines();
});

watch(
  () => props.issueId,
  () => {
    fetchTimelines();
  },
);
</script>

<template>
  <BaseCard>
    <template #title>
      <span class="text-xl font-semibold">{{ t('tenantIssues.timeline.title') }}</span>
    </template>
    <template #content>

      <div v-if="loading" class="flex items-center gap-3 py-2">
        <ProgressSpinner data-testid="tenant-issue-timeline-loading" style="width: 24px; height: 24px" />
        <span class="text-gray-600">{{ t('tenantIssues.loading') }}</span>
      </div>

      <Message v-else-if="error" severity="error" :closable="false" data-testid="tenant-issue-timeline-error">
        {{ t('tenantIssues.timeline.loadError') }}
      </Message>

      <div
        v-else-if="timelines.length === 0"
        data-testid="tenant-issue-timeline-empty"
        class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-gray-600"
      >
        {{ t('tenantIssues.timeline.empty') }}
      </div>

      <Timeline
        v-else
        :value="timelines"
        align="left"
        :pt="{
          eventOpposite: { class: '!flex-none !max-w-0 !min-w-0 !p-0' },
          eventContent: { class: '!pr-0' },
        }"
        data-testid="tenant-issue-timeline"
      >
        <template #content="slotProps">
          <div class="mb-2 flex items-start gap-3">
            <span class="w-40 shrink-0 text-sm text-gray-500">
              {{ formatTimelineDate(slotProps.item.createdAt) || '-' }}
            </span>
            <article
              data-testid="tenant-issue-timeline-entry"
              class="flex-1 rounded-lg border border-gray-200 bg-white p-4"
            >
              <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p class="font-medium text-gray-900">
                  {{ getTimelineTitle(slotProps.item.purpose) }}
                </p>
              </div>
              <p v-if="slotProps.item.message" class="text-gray-700 text-left whitespace-pre-line">
                {{ slotProps.item.message }}
              </p>
              <div v-if="getTimelineAttachmentCount(slotProps.item) > 0" class="mt-3 rounded bg-gray-50 p-2 text-sm">
                <p class="mb-1 text-left text-gray-700">
                  {{
                    t('tenantIssues.timeline.attachmentsCount')
                  }}
                </p>
                <div v-if="getTimelineAttachments(slotProps.item).length > 0" class="mb-3 flex flex-wrap gap-2">
                  <div
                    v-for="attachment in getTimelineImageAttachments(slotProps.item)"
                    :key="`preview-${attachment.attachmentId}`"
                    class="relative"
                  >
                    <Image
                      :src="attachment.downloadUrl"
                      :alt="attachment.fileName ?? 'issue-attachment'"
                      preview
                      imageClass="h-24 w-24 object-cover rounded"
                    />
                    <Button
                      icon="pi pi-download"
                      size="small"
                      severity="contrast"
                      rounded
                      class="!absolute bottom-1 right-1"
                      :aria-label="t('tenantIssues.timeline.downloadAttachment')"
                      @click="openAttachmentDownload(attachment.downloadUrl)"
                    />
                  </div>
                  <button
                    v-for="attachment in getTimelineNonImageAttachments(slotProps.item)"
                    :key="`file-${attachment.attachmentId}`"
                    type="button"
                    class="h-24 w-24 cursor-pointer rounded border border-surface-200 bg-surface-100 p-2 text-surface-700"
                    :aria-label="t('tenantIssues.timeline.downloadAttachment')"
                    @click="openAttachmentDownload(attachment.downloadUrl)"
                  >
                    <div class="flex h-full flex-col items-center justify-center gap-1">
                      <i class="pi pi-file text-xl" />
                      <span class="text-[10px] font-semibold">{{ getAttachmentTypeLabel(attachment) }}</span>
                    </div>
                  </button>
                </div>
                <ul v-if="getTimelineAttachments(slotProps.item).length > 0" class="space-y-2 text-left">
                  <li
                    v-for="(attachment) in getTimelineAttachments(slotProps.item)"
                    :key="attachment.attachmentId"
                    data-testid="tenant-issue-timeline-attachment-url"
                  >
                  </li>
                </ul>
              </div>
            </article>
          </div>
        </template>
      </Timeline>
      <div class="mb-4 flex flex-col gap-2">
        <Textarea
          id="tenant-timeline-message"
          v-model="messageText"
          data-testid="tenant-issue-timeline-message-input"
          rows="3"
          :placeholder="t('tenantIssues.timeline.messagePlaceholder')"
        />
        <div class="flex flex-col gap-1">
          <FileUpload
            :key="fileUploadKey"
            mode="advanced"
            :chooseLabel="t('tenantIssues.timeline.uploadButton')"
            multiple
            customUpload
            :showUploadButton="false"
            :showCancelButton="false"
            accept="image/*,video/*,application/pdf"
            :maxFileSize="10485760"
            :fileLimit="10"
            @select="onFilesSelected"
          >
            <template #empty>
              <div>{{ t('tenantIssues.timeline.uploadEmpty') }}</div>
            </template>
          </FileUpload>
        </div>
        <div class="flex justify-end">
          <Button
            data-testid="tenant-issue-timeline-message-submit"
            :label="t('tenantIssues.timeline.sendMessage')"
            icon="pi pi-send"
            :loading="sendingMessage"
            :disabled="!canSendMessage"
            @click="submitMessage"
          />
        </div>
      </div>
    </template>
  </BaseCard>
</template>