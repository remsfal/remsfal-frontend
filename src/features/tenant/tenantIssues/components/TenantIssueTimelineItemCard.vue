<script setup lang="ts">
import Button from 'primevue/button';
import Image from 'primevue/image';
import type { TimelineJson } from '@/features/tenant/tenantIssues/services/TenantTimelineService';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface TimelineAttachmentView {
  attachmentId: string;
  contentType?: string;
  downloadUrl: string;
  fileName?: string;
}

const props = defineProps<{
  item: TimelineJson;
  issueId: string;
}>();

const { t, locale } = useI18n();

const imageFileExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']);

const formatTimelineDate = (value?: string) => {
  if (!value) { return null; }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) { return value; }
  return date.toLocaleString(locale.value);
};

const getIssueNumber = (issueId: string) => issueId.split('-').pop() || issueId;

const getTimelineTitle = (timelineItem: TimelineJson) => {
  const senderName = timelineItem.senderName?.trim() || t('common.notSet');

  switch (timelineItem.purpose) {
    case 'ISSUE_CREATED':
      return t('tenantIssues.timeline.issueCreatedTitle', {
        issueNumber: getIssueNumber(timelineItem.issueId ?? props.issueId),
        senderName,
      });
    case 'MESSAGE_SENT':
      return t('tenantIssues.timeline.tenantMessageTitle', { senderName });
    case 'APPOINTMENT_REQUESTED':
      return t('tenantIssues.timeline.appointmentRequestedTitle', { senderName });
    case 'APPOINTMENT_SCHEDULED':
      return t('tenantIssues.timeline.appointmentScheduledTitle', { senderName });
    case 'STATUS_CHANGED':
      return t('tenantIssues.timeline.statusChangedTitle');
    default:
      return t('tenantIssues.timeline.entryFallbackTitle');
  }
};

const getTimelineAttachmentDownloadUrl = (issueId: string, attachmentId: string, fileName?: string) => {
  const encodedIssueId = encodeURIComponent(issueId);
  const encodedAttachmentId = encodeURIComponent(attachmentId);
  const encodedFileName = encodeURIComponent(fileName || attachmentId);
  return `/ticketing/v1/tenant-relations/issues/${encodedIssueId}/attachments/${encodedAttachmentId}/${encodedFileName}`;
};

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

const timelineAttachments = computed<TimelineAttachmentView[]>(() => {
  return (props.item.attachments ?? []).flatMap((attachment) => {
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
});

const timelineImageAttachments = computed(() => timelineAttachments.value.filter(isImageAttachment));
const timelineNonImageAttachments = computed(() =>
  timelineAttachments.value.filter((attachment) => !isImageAttachment(attachment)),
);

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
</script>

<template>
  <div class="mb-2 flex items-start gap-3">
    <span class="w-40 shrink-0 text-sm text-gray-500">
      {{ formatTimelineDate(item.createdAt) || '-' }}
    </span>
    <article
      data-testid="tenant-issue-timeline-entry"
      class="flex-1 rounded-lg border border-gray-200 bg-white p-4"
    >
      <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p class="text-lg font-semibold text-gray-900">
          {{ getTimelineTitle(item) }}
        </p>
      </div>
      <p v-if="item.message" class="text-gray-700 text-left whitespace-pre-line">
        {{ item.message }}
      </p>
      <div v-if="timelineAttachments.length > 0" class="mt-3 rounded bg-gray-50 p-2 text-sm">
        <p class="mb-1 text-left text-gray-700">
          {{ t('tenantIssues.timeline.attachmentsCount') }}
        </p>
        <div v-if="timelineAttachments.length > 0" class="mb-3 flex flex-wrap gap-2">
          <div
            v-for="attachment in timelineImageAttachments"
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
            v-for="attachment in timelineNonImageAttachments"
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
      </div>
    </article>
  </div>
</template>
