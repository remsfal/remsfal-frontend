<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Tag from 'primevue/tag';
import BaseCard from '@/components/common/BaseCard.vue';
import type { IssueItemJson } from '@/services/IssueService';

const props = defineProps<{
  issue: IssueItemJson;
}>();

const emit = defineEmits<{ select: [] }>();

const { t } = useI18n();

const statusSeverity = computed(() => {
  switch (props.issue.status) {
    case 'PENDING':
      return 'secondary';
    case 'OPEN':
      return 'info';
    case 'IN_PROGRESS':
      return 'warn';
    case 'CLOSED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    default:
      return 'secondary';
  }
});

const statusLabel = computed(() => {
  switch (props.issue.status) {
    case 'PENDING':
      return t('inbox.filters.status.pending');
    case 'OPEN':
      return t('inbox.filters.status.open');
    case 'IN_PROGRESS':
      return t('inbox.filters.status.inProgress');
    case 'CLOSED':
      return t('inbox.filters.status.closed');
    case 'REJECTED':
      return t('inbox.filters.status.rejected');
    default:
      return props.issue.status;
  }
});

const typeLabel = computed(() => {
  switch (props.issue.type) {
    case 'APPLICATION':
      return t('inbox.filters.type.application');
    case 'TASK':
      return t('inbox.filters.type.task');
    case 'DEFECT':
      return t('inbox.filters.type.defect');
    case 'MAINTENANCE':
      return t('inbox.filters.type.maintenance');
    default:
      return props.issue.type;
  }
});

const titleClass = computed(() => {
  const classes = ['text-xl', 'font-semibold'];

  if (props.issue.status === 'CLOSED') {
    classes.push('line-through', 'text-gray-500');
  } else {
    classes.push('text-gray-900');
  }

  return classes.join(' ');
});

</script>

<template>
  <button
    type="button"
    data-testid="tenant-issue-card"
    class="tenant-issue-card group w-full text-left"
    @click="emit('select')"
  >
    <BaseCard>
      <template #content>
        <div class="flex h-full min-h-72 w-full flex-col p-5 md:p-6">
          <div class="flex items-start justify-between gap-2">
            <span class="font-mono text-sm text-gray-500">
              {{ t('tenantIssues.card.number') }} {{ issue.id }}
            </span>
            <Tag :value="statusLabel" :severity="statusSeverity" rounded />
          </div>

          <h3 :class="[titleClass, 'mt-5 break-words']">
            {{ issue.title }}
          </h3>

          <dl class="mt-auto grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 pt-5 text-base">
              <dt class="font-medium text-gray-500">
                {{ t('tenantIssues.card.category') }}
              </dt>
              <dt class="shrink-0 font-medium text-gray-500">
                {{ t('tenantIssues.card.type') }}
              </dt>
              <dd class="min-w-0 break-words text-gray-900">
                {{ typeLabel }}
              </dd>
          </dl>
        </div>
      </template>
    </BaseCard>
  </button>
</template>

<style scoped>
.tenant-issue-card :deep(.p-card-body),
.tenant-issue-card :deep(.p-card-content) {
  padding: 0;
}
</style>
