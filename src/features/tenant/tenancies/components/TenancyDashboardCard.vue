<script setup lang="ts">
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

import BaseCard from '@/components/common/BaseCard.vue';
import type { TenancyJson } from '@/services/TenancyService';
import TenancyContractCard from './TenancyContractCard.vue';
import { useI18n } from 'vue-i18n';

defineProps<{
  contracts: TenancyJson[];
  loading: boolean;
  error: string | null;
}>();

const { t } = useI18n();
</script>

<template>
  <BaseCard>
    <template #title>
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <span class="text-xl font-semibold">{{ t('tenantDashboard.cardTitle') }}</span>
          <p class="text-base text-gray-500 font-normal mt-1">
            {{ t('tenantDashboard.cardSubtitle') }}
          </p>
        </div>
        <div v-if="loading" class="flex items-center gap-2">
          <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="4" />
          <span class="text-sm text-gray-500">{{ t('tenantDashboard.loading') }}</span>
        </div>
      </div>
    </template>

    <template #content>
      <Message v-if="error" severity="error" class="mb-4" :closable="false">
        {{ error }}
      </Message>

      <div v-if="contracts.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mt-4">
        <TenancyContractCard
          v-for="contract in contracts"
          :key="contract.agreementId"
          :contract="contract"
        />
      </div>

      <div
        v-else-if="!loading"
        class="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-gray-500"
        data-testid="empty-state"
      >
        {{ t('tenantDashboard.empty') }}
      </div>
    </template>
  </BaseCard>
</template>
