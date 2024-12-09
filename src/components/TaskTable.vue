<script setup lang="ts">
import { defineProps } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { type TaskItem } from '../services/TaskService';
import { RouterLink } from 'vue-router';

//const isLoading = ref(false);
const props = defineProps<{
  tasks: TaskItem[];
}>();
</script>

<template>
  <div class="tasks-table-container">
    <DataTable
      :value="tasks"
      scrollable
      rowHover
      :rows="10"
      dataKey="id"
      lazy
      paginator
      tableStyle="min-width: 75rem"
    >
      <Column field="title" header="Title" :sortable="true" />
      <Column field="description" header="Description" :sortable="true" />
      <Column field="owner" header="Owner" :sortable="true" />
      <Column field="status" header="Status" :sortable="true" />
      <Column frozen alignFrozen="right">
        <template #body="slotProps">
          <div class="flex justify-content-end">
            <RouterLink :to="{ name: 'TaskEdit', params: { taskid: slotProps.data.id} }">
              <Button
                icon="pi pi-pencil"
                severity="success"
                text
                raised
                rounded
                class="mb-2 mr-2"
                @click="$emit('edit', slotProps.data.id)"
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
.tasks-table-container {
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
