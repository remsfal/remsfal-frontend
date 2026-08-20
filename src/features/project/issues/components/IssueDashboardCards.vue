<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import BaseCard from '@/components/common/BaseCard.vue';
import { issueService, type IssueItemJson, type IssuePriority, type IssueStatus } from '@/services/IssueService';
import { getIssuePriorityLabel } from '@/features/common/issues/issueLabels';
import { useUserSessionStore } from '@/stores/UserSession';

const props = defineProps<{ projectId: string }>();
const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const sessionStore = useUserSessionStore();

const ACTIVE_STATUSES: IssueStatus[] = ['PENDING', 'OPEN', 'IN_PROGRESS'];
const OPEN_STATUSES: IssueStatus[] = ['OPEN', 'IN_PROGRESS'];

const PRIORITY_RANK: Record<IssuePriority, number> = {
  URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNCLASSIFIED: 4,
};
const priorityRank = (p?: IssuePriority): number => (p ? PRIORITY_RANK[p] : PRIORITY_RANK.UNCLASSIFIED);

const isLoading = ref(true);
const urgentIssues = ref<IssueItemJson[]>([]);
const recentIssues = ref<IssueItemJson[]>([]);

function reportLoadError() {
  toast.add({
    severity: 'error',
    summary: t('error.general'),
    detail: t('issueDashboard.loadError'),
    life: 6000,
  });
}

async function loadUrgentIssues(projectId: string, assigneeId?: string): Promise<IssueItemJson[]> {
  try {
    const page = await issueService.getIssues(projectId, OPEN_STATUSES, undefined, assigneeId);
    const open = (page.issues ?? []).filter((issue): issue is IssueItemJson & { id: string } => !!issue.id);
    return [...open].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority)).slice(0, 5);
  } catch {
    reportLoadError();
    return [];
  }
}

async function loadRecentIssues(projectId: string, assigneeId: string): Promise<IssueItemJson[]> {
  try {
    const page = await issueService.getIssues(
      projectId, ACTIVE_STATUSES, undefined, assigneeId, undefined, undefined, undefined, undefined, 5,
    );
    return (page.issues ?? []).filter((issue): issue is IssueItemJson & { id: string } => !!issue.id);
  } catch {
    reportLoadError();
    return [];
  }
}

async function loadData(projectId: string) {
  isLoading.value = true;
  const assigneeId = sessionStore.user?.id;
  const [urgent, recent] = await Promise.all([
    loadUrgentIssues(projectId, assigneeId),
    assigneeId ? loadRecentIssues(projectId, assigneeId) : Promise.resolve([]),
  ]);
  urgentIssues.value = urgent;
  recentIssues.value = recent;
  isLoading.value = false;
}

function onRowSelect(event: { data: IssueItemJson }) {
  if (!event.data.id) return;
  router.push({ name: 'IssueDetails', params: { projectId: props.projectId, issueId: event.data.id } });
}

onMounted(() => loadData(props.projectId));
</script>

<template>
  <div class="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="issue-dashboard-cards">
    <BaseCard :loading="isLoading" :skeletonRows="5">
      <template #title>
        {{ t('projectMenu.issueManagement.mine') }}
      </template>
      <template #content>
        <div v-if="urgentIssues.length === 0" class="text-muted-color text-sm">
          {{ t('issueDashboard.empty') }}
        </div>
        <DataTable
          v-else
          class="issue-dashboard-table"
          :value="urgentIssues"
          selectionMode="single"
          :metaKeySelection="false"
          :showHeaders="false"
          :pt="{ bodyRow: { 'data-testid': 'issue-dashboard-urgent-row' } }"
          @rowSelect="onRowSelect"
        >
          <Column field="title" :header="t('issueDetails.fields.title')">
            <template #body="slotProps">
              <span class="font-medium truncate">{{ slotProps.data.title }}</span>
            </template>
          </Column>
          <Column field="priority" :header="t('issueDetails.fields.priority')">
            <template #body="slotProps">
              <span class="text-muted-color text-sm">{{ getIssuePriorityLabel(slotProps.data.priority, t) }}</span>
            </template>
          </Column>
        </DataTable>
      </template>
    </BaseCard>

    <BaseCard :loading="isLoading" :skeletonRows="5">
      <template #title>
        {{ t('projectMenu.tenantCommunication.new') }}
      </template>
      <template #content>
        <div v-if="recentIssues.length === 0" class="text-muted-color text-sm">
          {{ t('issueDashboard.empty') }}
        </div>
        <DataTable
          v-else
          class="issue-dashboard-table"
          :value="recentIssues"
          selectionMode="single"
          :metaKeySelection="false"
          :showHeaders="false"
          :pt="{ bodyRow: { 'data-testid': 'issue-dashboard-recent-row' } }"
          @rowSelect="onRowSelect"
        >
          <Column field="title" :header="t('issueDetails.fields.title')">
            <template #body="slotProps">
              <span class="font-medium truncate">{{ slotProps.data.title }}</span>
            </template>
          </Column>
          <Column field="priority" :header="t('issueDetails.fields.priority')">
            <template #body="slotProps">
              <span class="text-muted-color text-sm">{{ getIssuePriorityLabel(slotProps.data.priority, t) }}</span>
            </template>
          </Column>
        </DataTable>
      </template>
    </BaseCard>
  </div>
</template>