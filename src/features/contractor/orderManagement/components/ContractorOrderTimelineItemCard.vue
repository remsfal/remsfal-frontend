<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ContractorTimelineJson } from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';
import { buildAttachmentDownloadUrl, useTimelineItem } from '@/composables/useTimelineItem';

const props = defineProps<{
  item: ContractorTimelineJson;
  requestId: string;
}>();

const { t } = useI18n();

const { title, attachments } = useTimelineItem(props, {
  titleNamespace: 'orderManagement.timeline',
  buildAttachmentUrl: buildAttachmentDownloadUrl(
    `/ticketing/v1/order-management/quotation-requests/${encodeURIComponent(props.requestId)}`,
  ),
});
</script>

<template>
  <TimelineEntryCard
    :date="item.createdAt"
    :title="title"
    :message="item.message"
    :attachments="attachments"
    :attachmentsLabel="t('orderManagement.timeline.attachmentsLabel')"
    :downloadAttachmentLabel="t('orderManagement.timeline.downloadAttachmentLabel')"
    testId="contractor-order-timeline-entry"
  />
</template>
