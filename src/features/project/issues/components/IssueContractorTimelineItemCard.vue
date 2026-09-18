<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ContractorTimelineJson } from '@/features/project/issues/services/ContractorTimelineService';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';
import { buildOrderAttachmentDownloadUrl, useTimelineItem } from '@/composables/useTimelineItem';

const props = defineProps<{
  item: ContractorTimelineJson;
  issueId: string;
}>();

const { t } = useI18n();

const { title, attachments } = useTimelineItem(props, {
  titleNamespace: 'issueContractorTimeline',
  buildAttachmentUrl: buildOrderAttachmentDownloadUrl(
    `/ticketing/v1/issues/${encodeURIComponent(props.issueId)}`,
    {
      QUOTATION_REQUEST: 'quotation-request',
      QUOTATION: 'quotations',
      ORDER_PLACEMENT: 'orders',
    },
  ),
});
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
