<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import TimelineCard from '@/components/TimelineCard.vue';
import ContractorOrderTimelineItemCard from './ContractorOrderTimelineItemCard.vue';
import type { UseTimelineOptions } from '@/composables/useTimeline';
import { contractorOrderTimelineService, type ContractorTimelineJson }
  from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';

interface RecipientOption {
  value: 'TENANT' | 'MANAGER';
  label: string;
  severity?: 'danger';
}

const props = defineProps<{
  issueId: string;
  requestId: string;
  title: string;
}>();

const { t } = useI18n();

const visibleToTenant = ref(false);
const selectedOption = ref<RecipientOption | null>(null);

const recipientOptions = computed<RecipientOption[]>(() => {
  const options: RecipientOption[] = [
    { value: 'MANAGER', label: t('orderManagement.timeline.recipientManager') },
  ];
  if (visibleToTenant.value) {
    options.unshift({
      value: 'TENANT', label: t('orderManagement.timeline.recipientTenant'), severity: 'danger',
    });
  }
  return options;
});

const hasRecipientChoice = computed(() => recipientOptions.value.length > 1);

const submitButtonLabel = computed(() =>
  selectedOption.value?.label ?? t('orderManagement.timeline.recipientManager'),
);

const loadTimelineEntries = () => {
  visibleToTenant.value = false;
  selectedOption.value = null;
  return contractorOrderTimelineService.getTimelineEntries(props.issueId).then((r) => {
    visibleToTenant.value = r.visibleToTenant;
    return r.timelines ?? [];
  });
};

const sendTimelineEntry: UseTimelineOptions['send'] = async (payload, files) => {
  await contractorOrderTimelineService.createTimelineEntryWithAttachments(
    props.issueId,
    {
      purpose: payload.purpose, message: payload.message ?? '', messageToTenant: selectedOption.value?.value === 'TENANT'
    },
    files,
  );
  selectedOption.value = null;
};
</script>

<template>
  <TimelineCard
    :load="loadTimelineEntries"
    :send="sendTimelineEntry"
    :watchSource="() => props.issueId"
    :hideComposer="hasRecipientChoice && !selectedOption"
    :title="title"
    loadErrorLogLabel="Error fetching order timeline:"
    sendErrorLogLabel="Error creating order timeline entry:"
  >
    <template #before-composer>
      <div v-if="hasRecipientChoice && !selectedOption" class="mb-4 flex flex-wrap justify-end gap-2">
        <Button
          v-for="option in recipientOptions"
          :key="option.value"
          :data-testid="`timeline-recipient-${option.value.toLowerCase()}`"
          :label="option.label"
          icon="pi pi-send"
          :severity="option.severity"
          @click="selectedOption = option"
        />
      </div>
    </template>
    <template #composer-actions="{ submit, cancel, canSubmit, sending, loading }">
      <div :class="hasRecipientChoice ? 'flex justify-between' : 'flex justify-end'">
        <Button
          v-if="hasRecipientChoice"
          data-testid="timeline-message-cancel"
          :label="t('button.cancel')"
          severity="secondary"
          :disabled="sending"
          @click="() => { cancel(); selectedOption = null; }"
        />
        <Button
          data-testid="timeline-message-submit"
          :label="submitButtonLabel"
          :severity="selectedOption?.severity"
          icon="pi pi-send"
          :loading="sending"
          :disabled="!canSubmit || loading"
          @click="submit"
        />
      </div>
    </template>
    <template #item="{ item }">
      <ContractorOrderTimelineItemCard :item="(item as ContractorTimelineJson)" :requestId="props.requestId" />
    </template>
  </TimelineCard>
</template>
