<script setup lang="ts">
import { computed, ref } from 'vue';
import TimelineCard from '@/components/common/TimelineCard.vue';
import type { TimelineSendPayload } from '@/composables/useTimeline';
import ContractorOrderTimelineItemCard from './ContractorOrderTimelineItemCard.vue';
import { contractorOrderTimelineService, type ContractorTimelineJson, type ParticipantRole }
  from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';
import { orderAttachmentService, type OrderAttachmentJson }
  from '@/features/contractor/orderManagement/services/OrderAttachmentService';

const props = defineProps<{
  requestId: string;
  recipient: ParticipantRole;
  title: string;
  attachments: OrderAttachmentJson[];
}>();

// Uploaded-this-session attachments, merged with the request's known attachments so newly sent
// files show a filename/download link immediately (see ContractorOrderTimelineItemCard — the
// timeline GET itself only returns attachmentIds, no metadata).
const sessionAttachments = ref(new Map<string, OrderAttachmentJson>());

const attachmentsById = computed(() => {
  const map = new Map<string, OrderAttachmentJson>();
  props.attachments.forEach((attachment) => {
    if (attachment.attachmentId) {
      map.set(attachment.attachmentId, attachment);
    }
  });
  sessionAttachments.value.forEach((attachment, id) => map.set(id, attachment));
  return map;
});

async function load(): Promise<ContractorTimelineJson[]> {
  const result = await contractorOrderTimelineService.getTimelineEntries(props.requestId);
  return result.timelines ?? [];
}

async function send(payload: TimelineSendPayload, files: File[]): Promise<void> {
  let attachmentIds: string[] = [];
  if (files.length > 0) {
    const uploaded = await orderAttachmentService.uploadAttachments(props.requestId, files);
    uploaded.forEach((attachment) => {
      if (attachment.attachmentId) {
        sessionAttachments.value.set(attachment.attachmentId, attachment);
      }
    });
    attachmentIds = uploaded.map((attachment) => attachment.attachmentId).filter((id): id is string => !!id);
  }

  await contractorOrderTimelineService.createTimelineEntry(props.requestId, {
    purpose: payload.purpose,
    message: payload.message ?? '',
    recipient: props.recipient,
    attachmentIds,
  });
}
</script>

<template>
  <TimelineCard
    :load="load"
    :send="send"
    :watchSource="() => props.requestId"
    :title="title"
    loadErrorLogLabel="Error fetching order timeline:"
    sendErrorLogLabel="Error creating order timeline entry:"
  >
    <template #item="{ item }">
      <ContractorOrderTimelineItemCard
        :item="(item as ContractorTimelineJson)"
        :requestId="props.requestId"
        :attachmentsById="attachmentsById"
      />
    </template>
  </TimelineCard>
</template>
