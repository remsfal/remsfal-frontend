<script setup lang="ts">
import TimelineCard from '@/components/common/TimelineCard.vue';
import ContractorOrderTimelineItemCard from './ContractorOrderTimelineItemCard.vue';
import { contractorOrderTimelineService, type ContractorTimelineJson, type ParticipantRole }
  from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';

const props = defineProps<{
  requestId: string;
  recipient: ParticipantRole;
  title: string;
}>();
</script>

<template>
  <TimelineCard
    :load="() => contractorOrderTimelineService.getTimelineEntries(requestId).then((r) => r.timelines ?? [])"
    :send="(payload, files) =>
      contractorOrderTimelineService.createTimelineEntryWithAttachments(
        requestId,
        { purpose: payload.purpose, message: payload.message ?? '', recipient },
        files,
      )"
    :watchSource="() => props.requestId"
    :title="title"
    loadErrorLogLabel="Error fetching order timeline:"
    sendErrorLogLabel="Error creating order timeline entry:"
  >
    <template #item="{ item }">
      <ContractorOrderTimelineItemCard :item="(item as ContractorTimelineJson)" :requestId="props.requestId" />
    </template>
  </TimelineCard>
</template>
