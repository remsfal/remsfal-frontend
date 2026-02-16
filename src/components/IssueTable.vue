<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { type IssueItem } from '@/services/IssueService.ts';

const props = defineProps<{
  issues: IssueItem[];
}>();

const emit = defineEmits<{
  rowSelect: [issue: IssueItem];
}>();

const onRowSelect = (event: any) => {
  emit('rowSelect', event.data);
};
</script>

<template>
  <DataTable 
    :value="props.issues" 
    tableStyle="min-width: 60rem" 
    :paginator="true" 
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
    <Column field="title" header="Title" sortable />
    <Column field="owner" header="Owner" sortable />
    <Column field="status" header="Status" sortable />
  </DataTable>
</template>
