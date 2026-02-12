<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { IssueItem } from '@/services/IssueService.ts';
import type { TenancyItem } from '@/services/TenancyService';
import TenantIssueCard from './TenantIssueCard.vue';
import DataView from 'primevue/dataview';

// Extended type with optional date fields that may be returned from API
type ExtendedIssueItem = IssueItem & {
  createdAt?: string;
  modifiedAt?: string;
  tenancyId?: string;
  projectId?: string;
};

const props = defineProps<{
  issues: ExtendedIssueItem[];
  contracts: TenancyItem[];
}>();

const { t } = useI18n();

const getContractAddress = (tenancyId?: string) => {
  if (!tenancyId) return undefined;
  const contract = props.contracts.find(c => c.id === tenancyId);
  return contract?.location || contract?.rentalTitle;
};
</script>

<template>
  <div class="mt-4">
    <DataView v-if="issues.length > 0" :value="issues" layout="grid">
      <template #grid="{ items }">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <TenantIssueCard
            v-for="issue in items"
            :key="issue.id"
            :issue="issue"
            :contractAddress="getContractAddress(issue.tenancyId)"
          />
        </div>
      </template>
    </DataView>

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
</template>
