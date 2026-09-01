<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ContractorTimelineJson } from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';
import type { OrderAttachmentJson } from '@/features/contractor/orderManagement/services/OrderAttachmentService';
import TimelineEntryCard, { type TimelineAttachmentView } from '@/components/common/TimelineEntryCard.vue';

const props = defineProps<{
  item: ContractorTimelineJson;
  requestId: string;
  attachmentsById: Map<string, OrderAttachmentJson>;
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

// Timeline entries only carry attachmentIds (no filename/contentType) — only IDs resolvable via
// attachmentsById (the request's known attachments plus anything uploaded earlier this session)
// can be rendered with a working download link; everything else shows as an unresolved hint below.
const resolvedAttachments = computed<TimelineAttachmentView[]>(() =>
  (props.item.attachmentIds ?? []).flatMap((attachmentId) => {
    const attachment = props.attachmentsById.get(attachmentId);
    if (!attachment?.fileName) {
      return [];
    }
    return [{
      attachmentId,
      contentType: attachment.contentType,
      fileName: attachment.fileName,
      downloadUrl: getAttachmentDownloadUrl(attachmentId, attachment.fileName),
    }];
  }),
);

const unresolvedAttachmentCount = computed(
  () => (props.item.attachmentIds ?? []).length - resolvedAttachments.value.length,
);
</script>

<template>
  <div>
    <TimelineEntryCard
      :date="item.createdAt"
      :title="getTimelineTitle(item)"
      :message="item.message"
      :attachments="resolvedAttachments"
      :attachmentsLabel="t('orderManagement.timeline.attachmentsLabel')"
      :downloadAttachmentLabel="t('orderManagement.timeline.downloadAttachmentLabel')"
      testId="contractor-order-timeline-entry"
    />
    <p
      v-if="unresolvedAttachmentCount > 0"
      data-testid="contractor-order-timeline-unresolved-attachment"
      class="ml-40 -mt-2 mb-2 pl-3 text-xs text-gray-400"
    >
      {{ t('orderManagement.timeline.unresolvedAttachment') }} ({{ unresolvedAttachmentCount }})
    </p>
  </div>
</template>
