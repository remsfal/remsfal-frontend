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
  <DataTable :value="props.issues" tableStyle="min-width: 60rem" :paginator="true" :rows="5">
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
    <Column frozen alignFrozen="right" bodyClass="flex flex-wrap justify-end">
      <template #body="slotProps">
        <div class="flex justify-end">
          <RouterLink :to="{ name: 'IssueEdit', params: { issueId: slotProps.data.id } }">
            <Button
              icon="pi pi-pencil"
              severity="success"
              text
              raised
              rounded
            />
          </RouterLink>
        </div>
      </template>
    </Column>
  </DataTable>
</template>
