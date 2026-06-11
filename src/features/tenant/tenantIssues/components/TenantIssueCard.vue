<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Tag from 'primevue/tag';
import BaseCard from '@/components/common/BaseCard.vue';
import type { IssueItemJson } from '@/services/IssueService';
import { getIssueStatusLabel, getIssueTypeLabel } from '@/features/tenant/tenantIssues/issueLabels';

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
  return getIssueStatusLabel(props.issue.status, t);
});

const typeLabel = computed(() => {
  return getIssueTypeLabel(props.issue.type, t);
});

const issueNodeId = computed(() => props.issue.id?.split('-').pop() || props.issue.id);

const typeSeverity = computed(() => {
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
      return 'info';
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
    <BaseCard cardClass="tenant-issue-card-surface flex flex-col gap-4 basis-full">
      <template #content>
        <div class="flex flex-col p-5 md:p-6">
          <h3 class="mt-5 break-words" :class="[titleClass]">
            {{ issue.title }}
          </h3>
          <div class="mt-3 flex flex-wrap gap-2">
            <Tag :value="issueNodeId" severity="info" class="inline-flex w-fit" />
            <Tag :value="typeLabel" :severity="typeSeverity" class="inline-flex w-fit" />
            <Tag :value="statusLabel" :severity="statusSeverity" class="inline-flex w-fit" />
          </div>
        </div>
      </template>
    </BaseCard>
  </button>
</template>

<style scoped>
.tenant-issue-card :deep(.tenant-issue-card-surface) {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tenant-issue-card:hover :deep(.tenant-issue-card-surface) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgb(0 0 0 / 0.18);
}

.tenant-issue-card :deep(.p-card-body),
.tenant-issue-card :deep(.p-card-content) {
  padding: 0;
}
</style>
