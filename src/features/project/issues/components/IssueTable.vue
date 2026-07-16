<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { type IssueItemJson } from '@/services/IssueService';
import { useProjectMembers } from '@/composables/useProjectMembers';

export type IssueColumn = 'title' | 'assignee' | 'status' | 'priority' | 'type';

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

const { t } = useI18n();

const { members } = useProjectMembers(toRef(props, 'projectId'));

const memberNameById = computed(() => new Map(members.value.map((m) => [m.id, m.name])));

const assigneeName = (assigneeId?: string) =>
  (assigneeId && memberNameById.value.get(assigneeId)) || assigneeId;

const isColumnVisible = (column: IssueColumn) => props.columns.includes(column);

const onRowSelect = (event: { data: IssueItemJson }) => {
  emit('rowSelect', event.data);
};
</script>

<template>
  <DataTable
    :value="props.issues"
    tableStyle="min-width: 60rem"
    paginator
    :rows="5"
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
    <Column v-if="isColumnVisible('title')" field="title" :header="t('issueDetails.fields.title')" sortable />
    <Column v-if="isColumnVisible('assignee')" field="assigneeId" :header="t('issueDetails.fields.assignee')" sortable>
      <template #body="slotProps">
        {{ assigneeName(slotProps.data.assigneeId) }}
      </template>
    </Column>
    <Column v-if="isColumnVisible('status')" field="status" :header="t('issueDetails.fields.status')" sortable />
    <Column v-if="isColumnVisible('priority')" field="priority" :header="t('issueDetails.fields.priority')" sortable />
    <Column v-if="isColumnVisible('type')" field="type" :header="t('issueDetails.fields.type')" sortable />
  </DataTable>
</template>
