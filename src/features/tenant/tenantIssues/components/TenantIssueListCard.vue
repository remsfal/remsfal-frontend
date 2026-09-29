<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import DataView from 'primevue/dataview';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import BaseCard from '@/components/BaseCard.vue';
import { tenancyService, type TenancyJson } from '@/services/TenancyService';
import type { IssueStatus, IssueType } from '@/features/project/issues/services/IssueService';
import { tenantIssueService, type TenantIssueJson } from '@/features/tenant/tenantIssues/services/TenantIssueService';
import { getIssueStatusLabel, getIssueTypeLabel } from '@/features/common/issues/issueLabels';
import NewTenancyIssueDialog from './NewTenancyIssueDialog.vue';
import TenantIssueListItem from './TenantIssueListItem.vue';

const { t } = useI18n();
const router = useRouter();

const contracts = ref<TenancyJson[]>([]);
const issues = ref<TenantIssueJson[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showNewIssueDialog = ref(false);
const searchQuery = ref('');

const filters = ref({
  tenancyId: null as string | null,
  status: null as IssueStatus | null,
  type: null as IssueType | null,
});

const tenancyOptions = computed(() =>
  contracts.value.map(contract => ({
    label:
      contract.rentalUnits?.[0]?.location ||
      contract.rentalUnits?.[0]?.title ||
      contract.agreementId,
    value: contract.agreementId,
  })),
);

const STATUS_ORDER: IssueStatus[] = ['PENDING', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'REJECTED'];
const statusOptions = computed(() =>
  STATUS_ORDER.map((value) => ({ label: getIssueStatusLabel(value, t), value })),
);

const TYPE_ORDER: IssueType[] = ['APPLICATION', 'TASK', 'DEFECT', 'MAINTENANCE', 'TERMINATION', 'INQUIRY'];
const typeOptions = computed(() =>
  TYPE_ORDER.map((value) => ({ label: getIssueTypeLabel(value, t), value })),
);

const getStatusOrder = (status: string | undefined) => {
  const index = STATUS_ORDER.indexOf(status as IssueStatus);
  return index === -1 ? 99 : index;
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
  try {
    contracts.value = await tenancyService.getTenancies();
  } catch (err) {
    console.error('Error loading contracts:', err);
    error.value = t('error.general');
    contracts.value = [];
  }
};

const loadIssues = async () => {
  try {
    const issueList = await tenantIssueService.getIssues();
    issues.value = issueList?.issues ?? [];
  } catch (err) {
    console.error('Error loading issues:', err);
    error.value = t('error.general');
    issues.value = [];
  }
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
  loading.value = true;
  error.value = null;
  try {
    await loadContracts();
    await loadIssues();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <BaseCard :loading="loading" :skeletonRows="5">
    <template #title>
      {{ t('tenantIssues.title') }}
    </template>
    <template #content>
      <Message v-if="error" severity="error" :closable="false" class="mb-4">
        {{ error }}
      </Message>

      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3 pb-3 border-b border-surface">
        <Select
          v-model="filters.tenancyId"
          inputId="tenant-issues-tenancy-filter"
          :ariaLabel="t('tenantIssues.filter.tenancy')"
          :options="tenancyOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('tenantIssues.filter.tenancy')"
          showClear
          class="w-full md:w-56"
        />
        <Select
          v-model="filters.status"
          inputId="tenant-issues-status-filter"
          :ariaLabel="t('issueDetails.fields.status')"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('issueDetails.fields.status')"
          showClear
          class="w-full md:w-56"
        />
        <Select
          v-model="filters.type"
          inputId="tenant-issues-type-filter"
          :ariaLabel="t('tenantIssues.filter.type')"
          :options="typeOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('tenantIssues.filter.type')"
          showClear
          class="w-full md:w-56"
        />

        <InputGroup class="flex-1 min-w-60">
          <InputGroupAddon>
            <i class="pi pi-search" />
          </InputGroupAddon>
          <InputText
            v-model="searchQuery"
            :placeholder="t('tenantIssues.search.placeholder')"
            :aria-label="t('tenantIssues.search.placeholder')"
          />
          <Button
            icon="pi pi-times"
            severity="secondary"
            :aria-label="t('tenantIssues.search.clear')"
            :disabled="!searchQuery"
            @click="searchQuery = ''"
          />
        </InputGroup>

        <Button
          :label="t('tenantIssues.newIssue')"
          icon="pi pi-plus"
          class="shrink-0 md:ml-auto"
          @click="showNewIssueDialog = true"
        />
      </div>

      <DataView v-if="filteredIssues.length > 0" :value="filteredIssues" dataKey="id">
        <template #list="{ items }">
          <div>
            <TenantIssueListItem
              v-for="(issue, index) in items"
              :key="issue.id"
              :issue="issue"
              :isLast="Number(index) === items.length - 1"
              @select="openIssue(issue)"
            />
          </div>
        </template>
      </DataView>

      <div v-else class="flex flex-col items-center justify-center py-12 text-center text-muted-color">
        <i class="pi pi-inbox text-4xl mb-4" />
        <p class="text-lg">
          {{ t('tenantIssues.empty') }}
        </p>
      </div>
    </template>
  </BaseCard>

  <NewTenancyIssueDialog
    v-model:visible="showNewIssueDialog"
    @issueCreated="handleIssueCreated"
  />
</template>
