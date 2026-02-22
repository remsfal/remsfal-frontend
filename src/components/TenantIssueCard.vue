<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { IssueItemJson } from '@/services/IssueService.ts';
import Card from 'primevue/card';
import Tag from 'primevue/tag';

// Extended type with optional date fields that may be returned from API
type ExtendedIssueItem = IssueItemJson & {
  createdAt?: string;
  modifiedAt?: string;
  tenancyId?: string;
  projectId?: string;
};

const props = defineProps<{
  issue: ExtendedIssueItem;
  contractAddress?: string;
}>();

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
  const classes = ['text-lg', 'font-medium'];

  if (props.issue.status === 'CLOSED') {
    classes.push('line-through', 'text-gray-500');
  } else if (props.issue.status === 'OPEN' || props.issue.status === 'IN_PROGRESS') {
    classes.push('text-green-600');
  } else {
    classes.push('text-gray-900');
  }

  return classes.join(' ');
});

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('de-DE');
};
</script>

<template>
  <Card class="shadow-sm border border-gray-200">
    <template #content>
      <div class="flex flex-col gap-3">
        <!-- Header: Issue Number and Status -->
        <div class="flex items-start justify-between gap-2">
          <span class="text-sm text-gray-500 font-mono">
            {{ t('tenantIssues.card.number') }} {{ issue.id }}
          </span>
          <Tag :value="statusLabel" :severity="statusSeverity" rounded />
        </div>

        <!-- Title -->
        <h3 :class="titleClass">
          {{ issue.title }}
        </h3>

        <!-- Contract and Property Info -->
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <i class="pi pi-file text-gray-400" />
          <span>{{ t('tenantIssues.card.contract') }}</span>
          <span v-if="contractAddress" class="text-gray-900">
            | {{ contractAddress }}
          </span>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-gray-500">{{ t('tenantIssues.card.created') }}:</span>
            <span class="text-gray-900 ml-1">{{ formatDate(issue.createdAt) }}</span>
          </div>
          <div>
            <span class="text-gray-500">{{ t('tenantIssues.card.updated') }}:</span>
            <span class="text-gray-900 ml-1">{{ formatDate(issue.modifiedAt) }}</span>
          </div>
        </div>

        <!-- Type -->
        <div class="text-sm">
          <span class="text-gray-500">{{ t('tenantIssues.card.type') }}:</span>
          <span class="text-gray-900 ml-1">{{ typeLabel }}</span>
        </div>
      </div>
    </template>
  </Card>
</template>
