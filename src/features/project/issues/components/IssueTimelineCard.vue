<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Tag from 'primevue/tag';
import TimelineCard from '@/components/common/TimelineCard.vue';
import IssueTimelineItemCard from './IssueTimelineItemCard.vue';
import { issueTimelineService } from '@/features/project/issues/services/IssueTimelineService';

const props = defineProps<{ issueId: string; visibleToTenants: boolean; }>();

const { t } = useI18n();

const visibilityTag = computed(() => (props.visibleToTenants
  ? { label: t('issueDetails.visibleToTenant.tag'), severity: 'warn' as const }
  : { label: t('issueDetails.visibleToTenant.internalTag'), severity: 'info' as const }));
</script>

<template>
  <TimelineCard
    :load="() => issueTimelineService.getTimelineEntries(issueId).then((r) => r.timelines ?? [])"
    :send="(payload, files) => issueTimelineService.createTimelineEntryWithAttachments(issueId, payload, files)"
    :watchSource="() => props.issueId"
    :title="t('issue.timeline.title')"
    loadErrorLogLabel="Error fetching issue timeline:"
    sendErrorLogLabel="Error creating timeline entry:"
  >
    <template #title>
      <div class="flex items-center justify-between gap-3 w-full">
        <span class="text-xl font-semibold">{{ t('issue.timeline.title') }}</span>
        <Tag :value="visibilityTag.label" :severity="visibilityTag.severity" />
      </div>
    </template>
    <template #item="{ item }">
      <IssueTimelineItemCard :item="item" :issueId="props.issueId" />
    </template>
  </TimelineCard>
</template>
