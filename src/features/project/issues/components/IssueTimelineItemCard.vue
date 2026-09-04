<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { TimelineJson } from '@/features/project/issues/services/IssueTimelineService';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';
import { useTimelineItem } from '@/composables/useTimelineItem';

const props = defineProps<{
  item: TimelineJson;
  issueId: string;
}>();

const { t } = useI18n();

const { title, attachments } = useTimelineItem(props, '/ticketing/v1/issues');
</script>

<template>
  <TimelineEntryCard
    :date="item.createdAt"
    :title="title"
    :message="item.message"
    :attachments="attachments"
    :attachmentsLabel="t('tenantIssues.timeline.attachmentsCount')"
    :downloadAttachmentLabel="t('tenantIssues.timeline.downloadAttachment')"
    testId="issue-timeline-entry"
  />
</template>
