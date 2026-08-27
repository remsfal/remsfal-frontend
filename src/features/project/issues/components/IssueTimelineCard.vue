<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import TimelineCard from '@/components/common/TimelineCard.vue';
import IssueTimelineItemCard from './IssueTimelineItemCard.vue';
import { issueTimelineService } from '@/features/project/issues/services/IssueTimelineService';

const props = defineProps<{ issueId: string; }>();

const { t } = useI18n();
</script>

<template>
  <TimelineCard
    :load="() => issueTimelineService.getTimelineEntries(issueId).then((r) => r.timelines ?? [])"
    :send="(payload, files) => issueTimelineService.createTimelineEntryWithAttachments(issueId, payload, files)"
    :watchSource="() => props.issueId"
    testIdPrefix="issue-timeline"
    :title="t('tenantIssues.timeline.title')"
    :emptyText="t('tenantIssues.timeline.empty')"
    :loadErrorText="t('tenantIssues.timeline.loadError')"
    :messagePlaceholder="t('tenantIssues.timeline.messagePlaceholder')"
    :uploadButtonLabel="t('tenantIssues.timeline.uploadButton')"
    :uploadEmptyText="t('tenantIssues.timeline.uploadEmpty')"
    :sendButtonLabel="t('tenantIssues.timeline.sendMessage')"
    :sendErrorMessage="t('tenantIssues.timeline.createError')"
    loadErrorLogLabel="Error fetching issue timeline:"
    sendErrorLogLabel="Error creating timeline entry:"
  >
    <template #item="{ item }">
      <IssueTimelineItemCard :item="item" :issueId="props.issueId" />
    </template>
  </TimelineCard>
</template>
