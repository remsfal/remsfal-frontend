<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
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

const PRIORITY_RANK: Record<IssuePriority, number> = {
  URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNCLASSIFIED: 4,
};
const priorityRank = (p?: IssuePriority): number => (p ? PRIORITY_RANK[p] : PRIORITY_RANK.UNCLASSIFIED);

const isLoading = ref(true);
const issues = ref<IssueItemJson[]>([]);

async function loadIssues(projectId: string): Promise<IssueItemJson[]> {
  const page = await issueService.getIssues(projectId, ACTIVE_STATUSES);
  return (page.issues ?? []).filter((issue): issue is IssueItemJson & { id: string } => !!issue.id);
}

const urgentIssues = computed(() => [...issues.value]
  .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
  .slice(0, 5));

const recentIssues = computed(() => {
  const assigneeId = sessionStore.user?.id;
  if (!assigneeId) return [];
  return [...issues.value]
    .filter((issue) => issue.assigneeId === assigneeId)
    .sort((a, b) => new Date(b.modifiedAt ?? 0).getTime() - new Date(a.modifiedAt ?? 0).getTime())
    .slice(0, 5);
});

async function loadData(projectId: string) {
  isLoading.value = true;
  try {
    issues.value = await loadIssues(projectId);
  } catch {
    issues.value = [];
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueOverview.loadError'),
      life: 6000,
    });
  } finally {
    isLoading.value = false;
  }
}

function onRowSelect(event: { data: IssueItemJson }) {
  if (!event.data.id) return;
  router.push({ name: 'IssueDetails', params: { projectId: props.projectId, issueId: event.data.id } });
}

onMounted(() => loadData(props.projectId));
</script>

<template>
  <div class="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="issue-overview-cards">
    <BaseCard :loading="isLoading" :skeletonRows="5">
      <template #title>
        {{ t('issueOverview.urgentTitle') }}
      </template>
      <template #content>
        <div v-if="urgentIssues.length === 0" class="text-muted-color text-sm">
          {{ t('issueOverview.empty') }}
        </div>
        <DataTable
          v-else
          class="issue-overview-table"
          :value="urgentIssues"
          selectionMode="single"
          :metaKeySelection="false"
          :showHeaders="false"
          :pt="{ bodyRow: { 'data-testid': 'issue-overview-urgent-row' } }"
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
        {{ t('issueOverview.myRecentTitle') }}
      </template>
      <template #content>
        <div v-if="recentIssues.length === 0" class="text-muted-color text-sm">
          {{ t('issueOverview.empty') }}
        </div>
        <DataTable
          v-else
          class="issue-overview-table"
          :value="recentIssues"
          selectionMode="single"
          :metaKeySelection="false"
          :showHeaders="false"
          :pt="{ bodyRow: { 'data-testid': 'issue-overview-recent-row' } }"
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