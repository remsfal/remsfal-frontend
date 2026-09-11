<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ContractorTimelineJson } from '@/features/project/issues/services/ContractorTimelineService';
import TimelineEntryCard, { type TimelineAttachmentView } from '@/components/TimelineEntryCard.vue';

const props = defineProps<{
  item: ContractorTimelineJson;
  issueId: string;
}>();

const { t } = useI18n();

const title = computed(() => {
  const senderName = props.item.senderName?.trim() || t('common.notSet');

  switch (props.item.purpose) {
    case 'ISSUE_CREATED':
      return t('issueContractorTimeline.issueCreatedTitle', { senderName });
    case 'MESSAGE_SENT':
      return t('issueContractorTimeline.messageTitle', { senderName });
    case 'APPOINTMENT_REQUESTED':
      return t('issueContractorTimeline.appointmentRequestedTitle', { senderName });
    case 'APPOINTMENT_SCHEDULED':
      return t('issueContractorTimeline.appointmentScheduledTitle', { senderName });
    case 'STATUS_CHANGED':
      return t('issueContractorTimeline.statusChangedTitle');
    default:
      return t('issueContractorTimeline.entryFallbackTitle');
  }
});

const buildDownloadUrl = (attachmentId: string, fileName?: string) => {
  const encodedIssueId = encodeURIComponent(props.issueId);
  const encodedAttachmentId = encodeURIComponent(attachmentId);
  const encodedFileName = encodeURIComponent(fileName || attachmentId);
  return `/ticketing/v1/issues/${encodedIssueId}/attachments/${encodedAttachmentId}/${encodedFileName}`;
};

const attachments = computed<TimelineAttachmentView[]>(() =>
  (props.item.attachments ?? []).flatMap((attachment) => {
    const attachmentId = attachment.attachmentId;
    if (!attachmentId) {
      return [];
    }

    const fileName = attachment.fileName;
    return [{
      attachmentId,
      contentType: attachment.contentType,
      downloadUrl: buildDownloadUrl(attachmentId, fileName),
      fileName,
    }];
  }),
);
</script>

<template>
  <TimelineEntryCard
    :date="item.createdAt"
    :title="title"
    :message="item.message"
    :attachments="attachments"
    :attachmentsLabel="t('issueContractorTimeline.attachmentsLabel')"
    :downloadAttachmentLabel="t('issueContractorTimeline.downloadAttachmentLabel')"
    testId="issue-contractor-timeline-entry"
  />
</template>
