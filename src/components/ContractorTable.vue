<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { ref, onMounted } from 'vue';
import type { components } from '../../src/services/api/ticketing-schema'; 
import { contractorService } from '@/services/ContractorService'; 

type IssueListJson = components['schemas']['IssueListJson'];
type IssueItemJson = components['schemas']['IssueItemJson'];

const isLoading = ref(false);
const issues = ref<IssueItemJson[]>([]);
const expandedRows = ref<Record<string, boolean>>({});

const loadIssues = async () => {
  isLoading.value = true;
  try {
    // Using contractorService here
    const issueList: IssueListJson = await contractorService.getIssues();
    issues.value = issueList.issues ?? [];
  } catch (error) {
    console.error('Failed to load issues', error);
    issues.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadIssues();
});
</script>

<template>
  <DataTable
    v-model:expandedRows="expandedRows"
    :value="issues"
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
        <p>
          <strong>Beschreibung:</strong>
          {{ slotProps.data.description || 'Keine Beschreibung' }}
        </p>
        <p><strong>Status:</strong> {{ slotProps.data.status }}</p>
      </div>
    </template>
  </DataTable>
</template>