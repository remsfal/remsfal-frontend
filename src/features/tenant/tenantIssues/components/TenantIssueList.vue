<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import Button from 'primevue/button';
import Select from 'primevue/select';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import { tenancyService, type TenancyJson } from '@/services/TenancyService';
import { issueService, type IssueJson, type IssueItemJson, type IssueStatus, type IssueType } from '@/services/IssueService';
import NewTenancyIssueDialog from '@/components/tenantIssue/NewTenancyIssueDialog.vue';
import TenantIssueCard from './TenantIssueCard.vue';

const { t } = useI18n();
const router = useRouter();

const contracts = ref<TenancyJson[]>([]);
const issues = ref<IssueItemJson[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showNewIssueDialog = ref(false);
const searchQuery = ref('');

const filters = ref({
  tenancyId: null as string | null,
  status: null as IssueStatus | null,
  type: null as IssueType | null,
});

const tenancyOptions = computed(() => [
  { label: t('tenantIssues.filter.allTenancies'), value: null },
  ...contracts.value.map(contract => ({
    label:
      contract.rentalUnits?.[0]?.location ||
      contract.rentalUnits?.[0]?.title ||
      contract.agreementId,
    value: contract.agreementId,
  })),
]);

const statusOptions = computed(() => [
  { label: t('tenantIssues.filter.allStatuses'), value: null },
  { label: t('inbox.filters.status.pending'), value: 'PENDING' },
  { label: t('inbox.filters.status.open'), value: 'OPEN' },
  { label: t('inbox.filters.status.inProgress'), value: 'IN_PROGRESS' },
  { label: t('inbox.filters.status.closed'), value: 'CLOSED' },
  { label: t('inbox.filters.status.rejected'), value: 'REJECTED' },
]);

const typeOptions = computed(() => [
  { label: t('tenantIssues.filter.allTypes'), value: null },
  { label: t('inbox.filters.type.application'), value: 'APPLICATION' },
  { label: t('inbox.filters.type.task'), value: 'TASK' },
  { label: t('inbox.filters.type.defect'), value: 'DEFECT' },
  { label: t('inbox.filters.type.maintenance'), value: 'MAINTENANCE' },
]);

const filteredIssues = computed(() => {
  let result = issues.value;

  if (filters.value.type) {
    result = result.filter((issue) => issue.type === filters.value.type);
  }

  if (!searchQuery.value) {
    return result;
  }

  const query = searchQuery.value.toLowerCase();
  return result.filter(issue =>
    issue.title?.toLowerCase().includes(query) ||
    issue.id?.toLowerCase().includes(query)
  );
});

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

    issues.value = (issueList?.issues ?? []) as IssueItemJson[];
  } catch (err) {
    console.error('Error loading issues:', err);
    error.value = t('error.general');
    issues.value = [];
  } finally {
    loading.value = false;
  }
};

const onSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchQuery.value = target.value;
};

const handleIssueCreated = (newIssue: IssueJson) => {
  issues.value = [newIssue as IssueItemJson, ...issues.value];
};

const openIssue = (issue: IssueItemJson) => {
  if (!issue.id) {
    return;
  }
  router.push({ name: 'TenantIssueDetails', params: { issueId: issue.id } });
};

watch(
  () => filters.value,
  () => {
    loadIssues();
  },
  { deep: true },
);

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

      <div class="flex flex-col gap-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Button :label="t('tenantIssues.newIssue')" icon="pi pi-plus" @click="showNewIssueDialog = true" />

          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select
              v-model="filters.tenancyId"
              :options="tenancyOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('tenantIssues.filter.tenancy')"
              class="w-full sm:w-64"
            />

            <Select
              v-model="filters.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('tenantIssues.filter.status')"
              class="w-full sm:w-48"
            />

            <Select
              v-model="filters.type"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('tenantIssues.filter.type')"
              class="w-full sm:w-48"
            />
          </div>
        </div>

        <div class="flex justify-end">
          <IconField class="w-full sm:w-80">
            <InputIcon class="pi pi-search" />
            <InputText
              :modelValue="searchQuery"
              :placeholder="t('tenantIssues.search.placeholder')"
              type="text"
              fluid
              @input="onSearchInput"
            />
          </IconField>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
        <span class="ml-3 text-gray-600">{{ t('tenantIssues.loading') }}</span>
      </div>

      <div v-else class="mt-4">
        <div v-if="filteredIssues.length > 0" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <TenantIssueCard
            v-for="issue in filteredIssues"
            :key="issue.id"
            :issue="issue"
            @select="openIssue(issue)"
          />
        </div>

        <div
          v-else
          class="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-12 text-center text-gray-500"
        >
          <i class="pi pi-inbox text-4xl mb-4 text-gray-400" />
          <p class="text-lg">
            {{ t('tenantIssues.empty') }}
          </p>
        </div>
      </div>

      <NewTenancyIssueDialog
        v-model:visible="showNewIssueDialog"
        @issueCreated="handleIssueCreated"
      />
    </div>
  </main>
</template>
