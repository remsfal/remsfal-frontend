<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { ref, onMounted } from 'vue';
import { type TaskListJson, type TaskItemJson } from '@/services/ContractorService';
import { contractorService } from '@/services/ContractorService';

const isLoading = ref(false);
const tasks = ref<TaskItemJson[]>([]);
const expandedRows = ref<Record<string, boolean>>({});

const loadTasks = async () => {
  isLoading.value = true;
  try {
    const taskList: TaskListJson = await contractorService.getTasks();
    tasks.value = taskList.tasks;
  } catch (error) {
    console.error('Failed to load tasks', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadTasks();
});
</script>

<template>
  <DataTable
    v-model:expandedRows="expandedRows"
    :value="tasks"
    scrollable
    :loading="isLoading"
    rowHover
    :rows="10"
    dataKey="id"
    paginator
    tableStyle="min-width: 75rem"
  >
    <Column :expander="true" headerStyle="width: 3rem" />
    <Column field="title" header="Titel" style="min-width: 200px" />
    <Column field="status" header="Status" style="min-width: 200px" />

    <template #expansion="slotProps">
      <div class="p-4">
        <h4>Details für "{{ slotProps.data.title }}"</h4>
        <p><strong>Beschreibung:</strong> {{ slotProps.data.description || 'Keine Beschreibung' }}</p>
        <p><strong>Status:</strong> {{ slotProps.data.status }}</p>
      </div>
    </template>
  </DataTable>
</template>