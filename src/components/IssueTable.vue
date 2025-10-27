<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { type IssueItem } from '../services/IssueService.ts';
import { RouterLink } from 'vue-router';

const props = defineProps<{
  issues: IssueItem[];
}>();
</script>

<template>
  <div class="issues-table-container">
    <DataTable :value="props.issues" tableStyle="min-width: 60rem" :paginator="true" :rows="5">
      <Column field="title" header="Title" sortable />
      <Column field="owner" header="Owner" sortable />
      <Column field="status" header="Status" sortable />
      <Column frozen alignFrozen="right">
        <template #body="slotProps">
          <div class="flex justify-end">
            <RouterLink :to="{ name: 'IssueEdit', params: { issueId: slotProps.data.id } }">
              <Button
                icon="pi pi-pencil"
                severity="success"
                text
                raised
                rounded
                class="mb-2 mr-2"
              />
            </RouterLink>
          </div>
        </template>
      </Column>
    </DataTable>
    <div class="btn-slot">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.issues-table-container {
  box-sizing: border-box;
  background: white;
  padding: 10px;
}

.btn-slot {
  display: flex;
  justify-content: end;
  padding: 10px;
}
</style>
