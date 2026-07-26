<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { type IssueItemJson } from '@/services/IssueService';
import { useProjectMembers } from '@/composables/useProjectMembers';
import { getIssueStatusLabel, getIssueTypeLabel, getIssuePriorityLabel } from '@/features/common/issues/issueLabels';

export type IssueColumn = 'title' | 'assignee' | 'status' | 'priority' | 'type' | 'issueNumber' | 'modifiedAt';

const props = withDefaults(
  defineProps<{
    issues: IssueItemJson[];
    projectId: string;
    columns?: IssueColumn[];
  }>(),
  { columns: () => ['title', 'assignee', 'status'] },
);

const emit = defineEmits<{
  rowSelect: [issue: IssueItemJson];
}>();

const { t, locale } = useI18n();

const COLUMN_DEFS: Record<IssueColumn, { field: string; headerKey: string }> = {
  issueNumber: { field: 'id', headerKey: 'issueDetails.fields.issueNumber' },
  title: { field: 'title', headerKey: 'issueDetails.fields.title' },
  type: { field: 'type', headerKey: 'issueDetails.fields.type' },
  status: { field: 'status', headerKey: 'issueDetails.fields.status' },
  priority: { field: 'priority', headerKey: 'issueDetails.fields.priority' },
  assignee: { field: 'assigneeId', headerKey: 'issueDetails.fields.assignee' },
  modifiedAt: { field: 'modifiedAt', headerKey: 'issueDetails.fields.modifiedAt' },
};

const { members } = useProjectMembers(toRef(props, 'projectId'));

const memberNameById = computed(() => new Map(members.value.map((m) => [m.id, m.name])));

const assigneeName = (assigneeId?: string) =>
  (assigneeId && memberNameById.value.get(assigneeId)) || assigneeId;

const issueNumber = (id?: string) => id?.split('-').pop() || id;

const modifiedAtLabel = (modifiedAt?: string) => {
  if (!modifiedAt) return undefined;
  const date = new Date(modifiedAt);
  return Number.isNaN(date.getTime()) ? modifiedAt : date.toLocaleDateString(locale.value);
};

const visibleColumns = computed(() => props.columns.map((key) => ({ key, ...COLUMN_DEFS[key] })));

const onRowSelect = (event: { data: IssueItemJson }) => {
  emit('rowSelect', event.data);
};
</script>

<template>
  <DataTable
    :value="props.issues"
    tableStyle="min-width: 60rem"
    paginator
    :rows="50"
    selectionMode="single"
    :metaKeySelection="false"
    @rowSelect="onRowSelect"
  >
    <template #header>
      <div class="flex justify-between flex-col sm:flex-row">
        <div>
          <!-- Placeholder for future controls if needed -->
        </div>
      </div>
    </template>
    <Column
      v-for="col in visibleColumns"
      :key="col.key"
      :field="col.field"
      :header="t(col.headerKey)"
      sortable
    >
      <template v-if="col.key === 'assignee'" #body="slotProps">
        {{ assigneeName(slotProps.data.assigneeId) }}
      </template>
      <template v-else-if="col.key === 'issueNumber'" #body="slotProps">
        {{ issueNumber(slotProps.data.id) }}
      </template>
      <template v-else-if="col.key === 'modifiedAt'" #body="slotProps">
        {{ modifiedAtLabel(slotProps.data.modifiedAt) }}
      </template>
      <template v-else-if="col.key === 'status'" #body="slotProps">
        {{ getIssueStatusLabel(slotProps.data.status, t) }}
      </template>
      <template v-else-if="col.key === 'type'" #body="slotProps">
        {{ getIssueTypeLabel(slotProps.data.type, t) }}
      </template>
      <template v-else-if="col.key === 'priority'" #body="slotProps">
        {{ getIssuePriorityLabel(slotProps.data.priority, t) }}
      </template>
    </Column>
  </DataTable>
</template>
