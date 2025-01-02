<script setup lang="ts">
import DataTable from 'primevue/datatable';
import { useContractorStore } from '@/stores/ContractorStore';
import { ref } from 'vue';
import Column from 'primevue/column';

const isLoading = ref(false);

const contractorStore = useContractorStore();
const expandedRows = ref<Record<string, boolean>>({});
</script>

<template>
  <DataTable
    v-model:expandedRows="expandedRows"
    :value="contractorStore.tasks"
    scrollable
    :loading="isLoading"
    rowHover
    :rows="10"
    dataKey="id"
    :totalRecords="contractorStore.totalTasks"
    lazy
    paginator
    tableStyle="min-width: 75rem"
  >
    <Column :expander="true" headerStyle="width: 3rem"></Column>  
    <Column field="title" header="Titel" style="min-width: 200px"></Column>
    <Column field="status" header="Status" style="min-width: 200px"></Column>

    <template #expansion="slotProps">
      <div class="p-3">
        <h4>Details für "{{ slotProps.data.title }}"</h4>
        <p><strong>Beschreibung:</strong> {{ slotProps.data.description }}</p>
        <p><strong>Status:</strong> {{ slotProps.data.status }}</p>
      </div>
    </template>
  </DataTable>
</template>