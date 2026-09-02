<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ContractorTimelineJson } from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';
import TimelineEntryCard, { type TimelineAttachmentView } from '@/components/common/TimelineEntryCard.vue';

const props = defineProps<{
  item: ContractorTimelineJson;
  requestId: string;
}>();

const { t } = useI18n();

const getTimelineTitle = (item: ContractorTimelineJson) => {
  const senderName = item.senderName?.trim() || t('common.notSet');

  switch (item.purpose) {
    case 'ISSUE_CREATED':
      return t('orderManagement.timeline.issueCreatedTitle', { senderName });
    case 'MESSAGE_SENT':
      return t('orderManagement.timeline.messageTitle', { senderName });
    case 'APPOINTMENT_REQUESTED':
      return t('orderManagement.timeline.appointmentRequestedTitle', { senderName });
    case 'APPOINTMENT_SCHEDULED':
      return t('orderManagement.timeline.appointmentScheduledTitle', { senderName });
    case 'STATUS_CHANGED':
      return t('orderManagement.timeline.statusChangedTitle');
    default:
      return t('orderManagement.timeline.entryFallbackTitle');
  }
};

const getAttachmentDownloadUrl = (attachmentId: string, fileName: string) => {
  const encodedRequestId = encodeURIComponent(props.requestId);
  const encodedAttachmentId = encodeURIComponent(attachmentId);
  const encodedFileName = encodeURIComponent(fileName);
  return `/ticketing/v1/order-management/quotation-requests/${encodedRequestId}`
    + `/attachments/${encodedAttachmentId}/${encodedFileName}`;
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
      downloadUrl: getAttachmentDownloadUrl(attachmentId, fileName || attachmentId),
      fileName,
    }];
  });
});
</script>

<template>
  <TimelineEntryCard
    :date="item.createdAt"
    :title="getTimelineTitle(item)"
    :message="item.message"
    :attachments="timelineAttachments"
    :attachmentsLabel="t('orderManagement.timeline.attachmentsLabel')"
    :downloadAttachmentLabel="t('orderManagement.timeline.downloadAttachmentLabel')"
    testId="contractor-order-timeline-entry"
  />
</template>
