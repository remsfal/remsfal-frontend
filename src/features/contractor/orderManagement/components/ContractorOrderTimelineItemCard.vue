<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ContractorTimelineJson } from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';
import { useTimelineItem } from '@/composables/useTimelineItem';

const props = defineProps<{
  item: ContractorTimelineJson;
  issueId: string;
}>();

const { t } = useI18n();

const { title, message, attachments } = useTimelineItem(props, { titleNamespace: 'orderManagement.timeline' });
</script>

<template>
  <TimelineEntryCard
    :date="item.createdAt"
    :title="title"
    :message="message"
    :attachments="attachments"
    :attachmentsLabel="t('orderManagement.timeline.attachmentsLabel')"
    :downloadAttachmentLabel="t('orderManagement.timeline.downloadAttachmentLabel')"
    testId="contractor-order-timeline-entry"
  />
</template>
