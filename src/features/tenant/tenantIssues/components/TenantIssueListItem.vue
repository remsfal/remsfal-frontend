<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Tag from 'primevue/tag';
import type { TenantIssueJson } from '@/features/tenant/tenantIssues/services/TenantIssueService';
import { getIssueStatusLabel, getIssueTypeSeverity,
  getIssueStatusSeverity, getIssueTypeLabel } from '@/features/common/issues/issueLabels';
const props = withDefaults(defineProps<{
  issue: TenantIssueJson;
  isLast?: boolean;
}>(), { isLast: false });

const emit = defineEmits<{ select: [] }>();

const { t, locale } = useI18n();

const statusSeverity = computed(() => getIssueStatusSeverity(props.issue.status));

const statusLabel = computed(() => {
  return getIssueStatusLabel(props.issue.status, t);
});

const typeLabel = computed(() => {
  return getIssueTypeLabel(props.issue.type, t);
});

const issueNodeId = computed(() => props.issue.id?.split('-').pop() || props.issue.id);
const modifiedAtLabel = computed(() => {
  const modifiedAt = props.issue.modifiedAt;
  if (!modifiedAt) {
    return null;
  }

  const date = new Date(modifiedAt);
  if (Number.isNaN(date.getTime())) {
    return `${t('tenantIssues.card.updated')} ${modifiedAt}`;
  }

  return `${t('tenantIssues.card.updated')} ${date.toLocaleDateString(locale.value)}`;
});

const typeSeverity = computed(() => getIssueTypeSeverity(props.issue.type));

const isFinished = computed(() => props.issue.status === 'CLOSED' || props.issue.status === 'REJECTED');

</script>

<template>
  <div
    data-testid="tenant-issue-item"
    class="interactive-row flex flex-col md:flex-row md:items-center gap-3 px-4 py-4"
    :class="{ 'border-b border-surface': !isLast }"
    role="button"
    tabindex="0"
    @click="emit('select')"
    @keydown.enter="emit('select')"
  >
    <div
      class="flex-1 min-w-0 font-semibold break-words"
      :class="{ 'line-through text-muted-color': isFinished }"
    >
      {{ issue.title }}
    </div>
    <div class="flex flex-wrap gap-2 md:justify-end">
      <Tag :value="issueNodeId" severity="info" />
      <Tag v-if="modifiedAtLabel" :value="modifiedAtLabel" severity="info" />
      <Tag :value="typeLabel" :severity="typeSeverity" />
      <Tag :value="statusLabel" :severity="statusSeverity" />
    </div>
  </div>
</template>
