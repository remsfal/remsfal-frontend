<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { type IssueItemJson } from '@/services/IssueService.ts';
import { useProjectMembers } from '@/composables/useProjectMembers';

const props = defineProps<{
  issues: IssueItemJson[];
  projectId: string;
}>();

const emit = defineEmits<{
  rowSelect: [issue: IssueItemJson];
}>();

const { t } = useI18n();

const { members } = useProjectMembers(toRef(props, 'projectId'));

const memberNameById = computed(() => new Map(members.value.map((m) => [m.id, m.name])));

const assigneeName = (assigneeId?: string) =>
  (assigneeId && memberNameById.value.get(assigneeId)) || assigneeId;

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
    <Column field="title" :header="t('issueDetails.fields.title')" sortable />
    <Column field="assigneeId" :header="t('issueDetails.fields.assignee')" sortable>
      <template #body="slotProps">
        {{ assigneeName(slotProps.data.assigneeId) }}
      </template>
    </Column>
    <Column field="status" :header="t('issueDetails.fields.status')" sortable />
  </DataTable>
</template>
