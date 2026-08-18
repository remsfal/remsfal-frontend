<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Skeleton from 'primevue/skeleton';
import KpiCard from '@/components/common/KpiCard.vue';
import { issueService } from '@/services/IssueService';

const props = defineProps<{ projectId: string }>();
const { t } = useI18n();
const toast = useToast();

type KpiStatus = 'PENDING' | 'OPEN' | 'IN_PROGRESS';

const KPI_STATUSES: KpiStatus[] = ['PENDING', 'OPEN', 'IN_PROGRESS'];

const STATUS_ICONS: Record<KpiStatus, string> = {
  PENDING: 'pi pi-clock',
  OPEN: 'pi pi-circle',
  IN_PROGRESS: 'pi pi-sync',
};

const STATUS_LABEL_KEYS: Record<KpiStatus, string> = {
  PENDING: 'issueKpi.status.pending',
  OPEN: 'issueKpi.status.open',
  IN_PROGRESS: 'issueKpi.status.inProgress',
};

function emptyCounts(): Record<KpiStatus, number> {
  return {
    PENDING: 0, OPEN: 0, IN_PROGRESS: 0 
  };
}

const isLoading = ref(true);
const statusCounts = ref(emptyCounts());

const kpis = computed(() =>
  KPI_STATUSES
    .map((status) => ({ status, count: statusCounts.value[status] }))
    .filter((kpi) => kpi.count > 0),
);

async function fetchIssueCounts(projectId: string) {
  try {
    const counts = emptyCounts();

    // Follows nextCursor until exhausted, since the backend caps a single page at 100 issues.
    let cursor: string | undefined;
    do {
      const page = await issueService.getIssues(
        projectId, undefined, undefined, undefined, undefined, undefined, undefined, cursor,
      );
      (page.issues ?? []).forEach((issue) => {
        if (issue.status === 'PENDING' || issue.status === 'OPEN' || issue.status === 'IN_PROGRESS') {
          counts[issue.status] += 1;
        }
      });
      cursor = page.nextCursor;
    } while (cursor);

    statusCounts.value = counts;
  } catch {
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueKpi.loadError'),
      life: 6000,
    });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => fetchIssueCounts(props.projectId));
</script>

<template>
  <div
    v-if="isLoading"
    data-testid="issue-kpi-cards"
    class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
  >
    <Skeleton v-for="i in 3" :key="i" height="6rem" borderRadius="0.75rem" />
  </div>
  <div
    v-else-if="kpis.length > 0"
    data-testid="issue-kpi-cards"
    class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
  >
    <KpiCard
      v-for="kpi in kpis"
      :key="kpi.status"
      :icon="STATUS_ICONS[kpi.status]"
      :title="t(STATUS_LABEL_KEYS[kpi.status])"
      :value="kpi.count"
    />
  </div>
</template>
