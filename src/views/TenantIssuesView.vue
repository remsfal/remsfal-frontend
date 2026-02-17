<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { tenancyService, type TenancyItem } from '@/services/TenancyService';
import { issueService, type IssueItem, type Status, type Type, type Issue } from '@/services/IssueService.ts';
import TenantIssueToolbar from '@/components/TenantIssueToolbar.vue';
import TenantIssueList from '@/components/TenantIssueList.vue';
import TenantNewIssueDialog from '@/components/TenantNewIssueDialog.vue';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';

const { t } = useI18n();

// Extended IssueItem type with additional fields for display
type ExtendedIssueItem = IssueItem & {
  projectId?: string;
  tenancyId?: string;
  createdAt?: string;
  modifiedAt?: string;
};

const contracts = ref<TenancyItem[]>([]);
const issues = ref<ExtendedIssueItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showNewIssueDialog = ref(false);

const filters = ref({
  tenancyId: null as string | null,
  status: null as Status | null,
  type: null as Type | null,
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
      undefined, // projectId - not used for tenants
      filters.value.status || undefined,
      filters.value.type || undefined,
      undefined, // assigneeId - not used for tenants
      filters.value.tenancyId || undefined,
    );

    // Cast to ExtendedIssueItem since the backend might return additional fields
    issues.value = (issueList?.issues ?? []) as ExtendedIssueItem[];
  } catch (err) {
    console.error('Error loading issues:', err);
    error.value = t('error.general');
    issues.value = [];
  } finally {
    loading.value = false;
  }
};

// Client-side search filter
const filteredIssues = computed(() => {
  if (!searchQuery.value) return issues.value;

  const query = searchQuery.value.toLowerCase();
  return issues.value.filter(issue =>
    issue.title?.toLowerCase().includes(query) ||
    issue.id?.toLowerCase().includes(query)
  );
});

// Watch filters and reload from server
watch(
  () => filters.value,
  () => {
    loadIssues();
  },
  { deep: true }
);

const handleIssueCreated = (newIssue: Issue) => {
  // Add the new issue to the list
  issues.value = [newIssue as ExtendedIssueItem, ...issues.value];
};

onMounted(async () => {
  await loadContracts();
  await loadIssues();
});
</script>

<template>
  <main>
    <div class="flex flex-col gap-4">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ t('tenantIssues.title') }}
        </h1>
      </div>

      <!-- Error Message -->
      <Message v-if="error" severity="error" :closable="false">
        {{ error }}
      </Message>

      <!-- Toolbar -->
      <TenantIssueToolbar
        v-model:tenancyId="filters.tenancyId"
        v-model:status="filters.status"
        v-model:type="filters.type"
        v-model:search="searchQuery"
        :contracts="contracts"
        @newIssue="showNewIssueDialog = true"
      />

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
        <span class="ml-3 text-gray-600">{{ t('tenantIssues.loading') }}</span>
      </div>

      <!-- Issue List -->
      <TenantIssueList
        v-else
        :issues="filteredIssues"
        :contracts="contracts"
      />

      <!-- New Issue Dialog -->
      <TenantNewIssueDialog
        v-model:visible="showNewIssueDialog"
        @issueCreated="handleIssueCreated"
      />
    </div>
  </main>
</template>
