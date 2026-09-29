<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ContractorTimelineJson } from '@/features/project/issues/services/ContractorTimelineService';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';
import { buildAttachmentDownloadUrl, useTimelineItem } from '@/composables/useTimelineItem';

const props = defineProps<{
  item: ContractorTimelineJson;
  issueId: string;
}>();

const { t } = useI18n();

const { title, message, attachments } = useTimelineItem(props, {
  titleNamespace: 'issueContractorTimeline',
  buildAttachmentUrl: buildAttachmentDownloadUrl(`/ticketing/v1/issues/${encodeURIComponent(props.issueId)}`),
});
</script>

<template>
  <TimelineEntryCard
    :date="item.createdAt"
    :title="title"
    :message="message"
    :attachments="attachments"
    :attachmentsLabel="t('issueContractorTimeline.attachmentsLabel')"
    :downloadAttachmentLabel="t('issueContractorTimeline.downloadAttachmentLabel')"
    testId="issue-contractor-timeline-entry"
  />
</template>
