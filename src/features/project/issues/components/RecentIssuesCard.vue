<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import BaseCard from '@/components/BaseCard.vue';
import { issueService, type IssueItemJson } from '@/features/project/issues/services/IssueService';
import { getIssueTypeLabel } from '@/features/common/issues/issueLabels';
import { useProjectStore } from '@/stores/ProjectStore';

const LIMIT = 5;

const { t } = useI18n();
const router = useRouter();
const projectStore = useProjectStore();

const isLoading = ref(true);
const issues = ref<IssueItemJson[]>([]);

function projectName(projectId?: string): string {
  return projectStore.projectList.find((project) => project.id === projectId)?.name ?? '';
}

async function loadIssues() {
  try {
    const page = await issueService.getLatestIssues(LIMIT);
    issues.value = (page.issues ?? []).filter((issue): issue is IssueItemJson & { id: string } => !!issue.id);
  } catch (error) {
    console.error('Failed to load latest issues:', error);
    issues.value = [];
  }
}

async function loadData() {
  isLoading.value = true;
  await Promise.all([loadIssues(), projectStore.refreshProjectList()]);
  isLoading.value = false;
}

function onRowSelect(event: { data: IssueItemJson }) {
  const { id, projectId } = event.data;
  if (!id || !projectId) return;
  router.push({ name: 'IssueDetails', params: { projectId, issueId: id } });
}

onMounted(loadData);
</script>

<template>
  <div class="mb-6" data-testid="recent-issues-card">
    <BaseCard :loading="isLoading" :skeletonRows="5">
      <template #title>
        {{ t('managerDashboard.recentIssues.title') }}
      </template>
      <template #content>
        <div v-if="issues.length === 0" class="text-muted-color text-sm">
          {{ t('issueDashboard.empty') }}
        </div>
        <DataTable
          v-else
          class="issue-dashboard-table"
          :value="issues"
          selectionMode="single"
          :metaKeySelection="false"
          :showHeaders="false"
          :pt="{ bodyRow: { 'data-testid': 'recent-issues-row' } }"
          @rowSelect="onRowSelect"
        >
          <Column field="title" :header="t('issueDetails.fields.title')">
            <template #body="slotProps">
              <span class="font-medium truncate">{{ slotProps.data.title }}</span>
            </template>
          </Column>
          <Column field="type" :header="t('issueDetails.fields.type')">
            <template #body="slotProps">
              <span class="text-muted-color text-sm">{{ getIssueTypeLabel(slotProps.data.type, t) }}</span>
            </template>
          </Column>
          <Column field="projectId">
            <template #body="slotProps">
              <span class="text-muted-color text-sm">{{ projectName(slotProps.data.projectId) }}</span>
            </template>
          </Column>
        </DataTable>
      </template>
    </BaseCard>
  </div>
</template>
