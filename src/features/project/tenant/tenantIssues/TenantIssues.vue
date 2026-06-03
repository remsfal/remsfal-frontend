<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import { tenancyService, type TenancyJson } from '@/services/TenancyService';
import { issueService, type IssueStatus, type IssueType, type IssueJson } from '@/services/IssueService';
import NewTenancyIssueDialog from '@/components/tenantIssue/NewTenancyIssueDialog.vue';
import type { TenantIssueItem } from './types';
import TenantIssueToolbar from './components/TenantIssueToolbar.vue';
import TenantIssueList from './components/TenantIssueList.vue';

const { t } = useI18n();
const router = useRouter();

const contracts = ref<TenancyJson[]>([]);
const issues = ref<TenantIssueItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showNewIssueDialog = ref(false);

const filters = ref({
  tenancyId: null as string | null,
  status: null as IssueStatus | null,
  type: null as IssueType | null,
});

const searchQuery = ref('');

const loadContracts = async () => {
  loading.value = true;
  error.value = null;

  try {
    contracts.value = await tenancyService.getTenancies();
  } catch (err) {
    console.error('Error loading contracts:', err);
    error.value = t('error.general');
    contracts.value = [];
  } finally {
    loading.value = false;
  }
};

const loadIssues = async () => {
  loading.value = true;
  error.value = null;

  try {
    const issueList = await issueService.getIssues(
      undefined,
      true,
      filters.value.status || undefined,
      undefined,
      filters.value.tenancyId || undefined,
    );

    issues.value = (issueList?.issues ?? []) as TenantIssueItem[];
  } catch (err) {
    console.error('Error loading issues:', err);
    error.value = t('error.general');
    issues.value = [];
  } finally {
    loading.value = false;
  }
};

const filteredIssues = computed(() => {
  let result = issues.value;

  if (filters.value.type) {
    result = result.filter((issue) => issue.type === filters.value.type);
  }

  if (!searchQuery.value) return result;

  const query = searchQuery.value.toLowerCase();
  return result.filter(issue =>
    issue.title?.toLowerCase().includes(query) ||
    issue.id?.toLowerCase().includes(query)
  );
});

watch(
  () => filters.value,
  () => {
    loadIssues();
  },
  { deep: true }
);

const handleIssueCreated = (newIssue: IssueJson) => {
  issues.value = [newIssue as TenantIssueItem, ...issues.value];
};

const openIssue = (issue: TenantIssueItem) => {
  if (!issue.id) {
    return;
  }
  router.push({ name: 'TenantIssueDetails', params: { issueId: issue.id } });
};

onMounted(async () => {
  await loadContracts();
  await loadIssues();
});
</script>

<template>
  <main>
    <div class="flex flex-col gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ t('tenantIssues.title') }}
        </h1>
      </div>

      <Message v-if="error" severity="error" :closable="false">
        {{ error }}
      </Message>

      <TenantIssueToolbar
        v-model:tenancyId="filters.tenancyId"
        v-model:status="filters.status"
        v-model:type="filters.type"
        v-model:search="searchQuery"
        :contracts="contracts"
        @newIssue="showNewIssueDialog = true"
      />

      <div v-if="loading" class="flex items-center justify-center py-12">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
        <span class="ml-3 text-gray-600">{{ t('tenantIssues.loading') }}</span>
      </div>

      <TenantIssueList
        v-else
        :issues="filteredIssues"
        @select="openIssue"
      />

      <NewTenancyIssueDialog
        v-model:visible="showNewIssueDialog"
        @issueCreated="handleIssueCreated"
      />
    </div>
  </main>
</template>
