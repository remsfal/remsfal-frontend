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

const issueNodeId = computed(() => props.issue.id?.split('-')[0] || props.issue.id);

const typestatus = computed(() => {
  switch (props.issue.type) {
    case 'APPLICATION':
      return 'info';
    case 'TASK':
      return 'secondary';
    case 'DEFECT':
      return 'danger';
    case 'MAINTENANCE':
      return 'warn';
    default:
      return 'secondary';
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
        <div class="flex flex-col p-5 md:p-6">
          <h3 :class="[titleClass, 'mt-5 break-words']">
            {{ issue.title }}
          </h3>
          <div class="mt-3 flex flex-wrap gap-2">
            <Tag :value="statusLabel" :severity="statusSeverity" class="inline-flex w-fit"/>
            <Tag :value="issueNodeId" severity="contrast" class="inline-flex w-fit" />
            <Tag :value="typeLabel" :severity="typestatus" class="inline-flex w-fit" />
          </div>
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
