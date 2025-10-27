<script setup lang="ts">
import DataTable, {type DataTablePageEvent,
  type DataTableRowClickEvent,} from 'primevue/datatable';
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
    rowHover
    :rows="10"
    dataKey="id"
    :totalRecords="projectStore.totalProjects"
    lazy
    paginator
    tableStyle="min-width: 75rem"
    @rowClick="onRowClick"
    @page="onPageChange"
  >
    <Column field="name" :header="t('projectTable.title')" style="min-width: 200px"></Column>
    <Column field="memberRole" :header="t('projectTable.role')" style="min-width: 200px"></Column>
  </DataTable>
</template>
