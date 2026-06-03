<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Tag from 'primevue/tag';
import type { TenantIssueItem } from '../types';

const props = defineProps<{
  issue: TenantIssueItem;
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
    class="flex min-h-72 w-full flex-col gap-5 rounded-lg border border-gray-200 p-5 text-left shadow-sm transition-colors
      hover:border-primary-300 hover:bg-primary-50/20 md:p-6"
    @click="emit('select')"
  >
    <div class="flex items-start justify-between gap-2">
      <span class="text-sm text-gray-500 font-mono">
        {{ t('tenantIssues.card.number') }} {{ issue.id }}
      </span>
      <Tag :value="statusLabel" :severity="statusSeverity" rounded />
    </div>

    <h3 :class="titleClass">
      {{ issue.title }}
    </h3>

    <dl class="text-base text-gray-600 space-y-1">
      <div class="flex justify-between gap-2">
        <dt class="font-medium text-gray-500">
          {{ t('tenantIssues.card.category') }}
        </dt>
      </div>
      <div class="flex justify-start gap-2">
        <dt class="font-medium text-gray-500">
          {{ t('tenantIssues.card.type') }}
        </dt>
        <dd class="text-gray-900">
          {{ typeLabel }}
        </dd>
      </div>
    </dl>
  </button>
</template>
