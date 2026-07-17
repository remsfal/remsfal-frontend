<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
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
import type { IssueStatus, IssueType } from '@/services/IssueService';
import { tenantIssueService, type TenantIssueJson } from '@/services/TenantIssueService';
import NewTenancyIssueDialog from '@/components/tenantIssue/NewTenancyIssueDialog.vue';
import TenantIssueCard from '../components/TenantIssueCard.vue';

const { t } = useI18n();
const router = useRouter();

const contracts = ref<TenancyJson[]>([]);
const issues = ref<TenantIssueJson[]>([]);
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
  { label: t('issueType.application'), value: 'APPLICATION' },
  { label: t('issueType.task'), value: 'TASK' },
  { label: t('issueType.defect'), value: 'DEFECT' },
  { label: t('issueType.maintenance'), value: 'MAINTENANCE' },
  { label: t('issueType.termination'), value: 'TERMINATION' },
  { label: t('issueType.inquiry'), value: 'INQUIRY' },
]);

const getStatusOrder = (status: string | undefined) => {
  switch (status) {
    case 'PENDING':
      return 1;
    case 'OPEN':
      return 2;
    case 'IN_PROGRESS':
      return 3;
    case 'CLOSED':
      return 4;
    case 'REJECTED':
      return 5;
    default:
      return 99;
  }
};

const filteredIssues = computed(() => {
  let result = issues.value;

  if (filters.value.tenancyId) {
    result = result.filter((issue) => issue.agreementId === filters.value.tenancyId);
  }

  if (filters.value.status) {
    result = result.filter((issue) => issue.status === filters.value.status);
  }

  if (filters.value.type) {
    result = result.filter((issue) => issue.type === filters.value.type);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(issue =>
      issue.title?.toLowerCase().includes(query) ||
      issue.id?.toLowerCase().includes(query)
    );
  }

  if (filters.value.status) {
    return result;
  }

  return [...result].sort((a, b) => getStatusOrder(a.status) - getStatusOrder(b.status));
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
    const issueList = await tenantIssueService.getIssues();

    issues.value = issueList?.issues ?? [];
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

const handleIssueCreated = (newIssue: TenantIssueJson) => {
  issues.value = [newIssue, ...issues.value];
};

const openIssue = (issue: TenantIssueJson) => {
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
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12">
      <h1 class="text-2xl font-semibold text-gray-900">
        {{ t('tenantIssues.title') }}
      </h1>
    </div>

    <Message v-if="error" severity="error" :closable="false" class="col-span-12">
      {{ error }}
    </Message>

    <div class="col-span-12 flex flex-col gap-4 mb-6">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div class="grid w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div>
            <label for="tenancy-select" class="hidden">
              {{ t('tenantIssues.filter.status') }}
            </label>
            <Select
              id="tenancy-select"
              v-model="filters.tenancyId"
              :options="tenancyOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('tenantIssues.filter.tenancy')"
              class="w-full"
            />
          </div>

          <div>
            <label for="status-select" class="hidden">
              {{ t('tenantIssues.filter.status') }}
            </label>
            <Select
              id="status-select"
              v-model="filters.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('tenantIssues.filter.status')"
              class="w-full"
            />
          </div>

          <div>
            <label for="type-select" class="hidden">
              {{ t('tenantIssues.filter.type') }}
            </label>
            <Select
              id="type-select"
              v-model="filters.type"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('tenantIssues.filter.type')"
              class="w-full"
            />
          </div>
          <div>
            <IconField class="w-full">
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

        <Button
          :label="t('tenantIssues.newIssue')"
          icon="pi pi-plus"
          class="self-start xl:ml-auto xl:self-auto shrink-0"
          @click="showNewIssueDialog = true"
        />
      </div>
    </div>

    <div v-if="loading" class="col-span-12 flex items-center justify-center py-12">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="ml-3 text-gray-600">{{ t('tenantIssues.loading') }}</span>
    </div>

    <div v-else class="col-span-12 mt-4">
      <div
        v-if="filteredIssues.length > 0"
        class="mt-6 grid content-start gap-5"
      >
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

    <div class="col-span-12">
      <NewTenancyIssueDialog
        v-model:visible="showNewIssueDialog"
        @issueCreated="handleIssueCreated"
      />
    </div>
  </div>
</template>
