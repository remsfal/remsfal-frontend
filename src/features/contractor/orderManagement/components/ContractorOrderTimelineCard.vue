<script setup lang="ts">
import TimelineCard from '@/components/TimelineCard.vue';
import ContractorOrderTimelineItemCard from './ContractorOrderTimelineItemCard.vue';
import { contractorOrderTimelineService, type ContractorTimelineJson }
  from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';

const props = defineProps<{
  issueId: string;
  requestId: string;
  title: string;
}>();
</script>

<template>
  <TimelineCard
    :load="() => contractorOrderTimelineService.getTimelineEntries(issueId).then((r) => r.timelines ?? [])"
    :send="(payload, files) =>
      contractorOrderTimelineService.createTimelineEntryWithAttachments(
        issueId,
        { purpose: payload.purpose, message: payload.message ?? '' },
        files,
      )"
    :watchSource="() => props.issueId"
    :title="title"
    loadErrorLogLabel="Error fetching order timeline:"
    sendErrorLogLabel="Error creating order timeline entry:"
  >
    <template #item="{ item }">
      <ContractorOrderTimelineItemCard :item="(item as ContractorTimelineJson)" :requestId="props.requestId" />
    </template>
  </TimelineCard>
</template>
