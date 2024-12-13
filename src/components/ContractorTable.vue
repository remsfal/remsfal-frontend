<script setup lang="ts">
import DataTable from 'primevue/datatable';
import { useContractorStore } from '@/stores/ContractorStore';

import { ref } from 'vue';
import Column from 'primevue/column';

const isLoading = ref(false);

const contractorStore = useContractorStore();

</script>

<template>
  <DataTable
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
    <Column field="title" header="Titel" style="min-width: 200px"></Column>
    <Column field="status" header="Status" style="min-width: 200px"></Column>
    <Column field="createdAt" header="Erstellt am" style="min-width: 200px"></Column>
  </DataTable>
</template>