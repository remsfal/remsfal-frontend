<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import TimelineCard from '@/components/common/TimelineCard.vue';
import type { TimelineJson } from '@/composables/useTimeline';
import TenantIssueTimelineItemCard from './TenantIssueTimelineItemCard.vue';
import { tenantTimelineService } from '@/features/tenant/tenantIssues/services/TenantTimelineService';

const props = defineProps<{ issueId: string; }>();

const { t } = useI18n();

const blockingStatusMessages = new Set(['CLOSED', 'REJECTED']);

const isBlocked = (items: TimelineJson[]) =>
  items.some((timeline) =>
    timeline.purpose === 'STATUS_CHANGED' && blockingStatusMessages.has(timeline.message?.trim().toUpperCase() ?? ''),
  );
</script>

<template>
  <TimelineCard
    :load="() => tenantTimelineService.getTimelineEntries(issueId).then((r) => r.timelines ?? [])"
    :send="(payload, files) => tenantTimelineService.createTimelineEntryWithAttachments(issueId, payload, files)"
    :watchSource="() => props.issueId"
    :isBlocked="isBlocked"
    :title="t('tenantIssues.timeline.title')"
    loadErrorLogLabel="Error fetching issue timeline:"
    sendErrorLogLabel="Error creating timeline entry:"
  >
    <template #item="{ item }">
      <TenantIssueTimelineItemCard :item="item" :issueId="props.issueId" />
    </template>
  </TimelineCard>
</template>