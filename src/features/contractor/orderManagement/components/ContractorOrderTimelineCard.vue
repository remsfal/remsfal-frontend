<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import TimelineCard from '@/components/TimelineCard.vue';
import ContractorOrderTimelineItemCard
  from '@/features/contractor/orderManagement/components/ContractorOrderTimelineItemCard.vue';
import type { UseTimelineOptions } from '@/composables/useTimeline';
import { useEventBus } from '@/stores/EventStore';
import { contractorOrderTimelineService, type ContractorTimelineJson }
  from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';

const props = defineProps<{
  issueId: string;
  title: string;
}>();

const { t } = useI18n();
const eventBus = useEventBus();

const refreshTick = ref(0);
const unsubscribeIssueRequestCreated = eventBus.on('issueRequest:created', ({ issueId }) => {
  if (issueId === props.issueId) {
    refreshTick.value += 1;
  }
});
onUnmounted(unsubscribeIssueRequestCreated);
const unsubscribeIssueRequestWithdrawn = eventBus.on('issueRequest:withdrawn', ({ issueId }) => {
  if (issueId === props.issueId) {
    refreshTick.value += 1;
  }
});
onUnmounted(unsubscribeIssueRequestWithdrawn);

const loadTimelineEntries = () => contractorOrderTimelineService.getTimelineEntries(props.issueId);

const sendTimelineEntry: UseTimelineOptions['send'] = async (payload, files) => {
  await contractorOrderTimelineService.createTimelineEntryWithAttachments(
    props.issueId,
    { purpose: payload.purpose, message: payload.message ?? '' },
    files,
  );
};
</script>

<template>
  <TimelineCard
    :load="loadTimelineEntries"
    :send="sendTimelineEntry"
    :watchSource="() => `${props.issueId}:${refreshTick}`"
    :title="title"
    :sendButtonLabel="t('orderManagement.timeline.recipientManager')"
    loadErrorLogLabel="Error fetching order timeline:"
    sendErrorLogLabel="Error creating order timeline entry:"
  >
    <template #item="{ item }">
      <ContractorOrderTimelineItemCard :item="(item as ContractorTimelineJson)" :issueId="props.issueId" />
    </template>
  </TimelineCard>
</template>
