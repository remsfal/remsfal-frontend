<script setup lang="ts">
import DataTable, {
  type DataTablePageEvent,
  type DataTableRowClickEvent,
} from 'primevue/datatable';
import { useProjectStore } from '@/stores/ProjectStore';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import Column from 'primevue/column';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const isLoading = ref(false);

const projectStore = useProjectStore();
const router = useRouter();

function onRowClick(event: DataTableRowClickEvent): void {
  projectStore.setSelectedProject(event.data);
  router.push({ name: 'ProjectDashboard', params: { projectId: projectStore.projectId } });
}

function onPageChange(event: DataTablePageEvent): void {
  isLoading.value = true;
  projectStore.fetchProjects(event.first, event.rows).finally(() => {
    isLoading.value = false;
  });
}
</script>

<template>
  <DataTable
    :value="projectStore.projects"
    scrollable
    :loading="isLoading"
    row-hover
    :rows="10"
    data-key="id"
    :total-records="projectStore.totalProjects"
    lazy
    paginator
    table-style="min-width: 75rem"
    @row-click="onRowClick"
    @page="onPageChange"
  >
    <Column
      field="name"
      :header="t('projectTable.title')"
      style="min-width: 200px"
    />
    <Column
      field="memberRole"
      :header="t('projectTable.role')"
      style="min-width: 200px"
    />
  </DataTable>
</template>
