<script setup lang="ts">
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

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
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3">
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

    <Message v-if="error" severity="error" class="mt-4 mb-4" :closable="false">
      {{ error }}
    </Message>

    <div v-if="contracts.length" class="mt-4 grid gap-5 md:grid-cols-2">
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
  </section>
</template>
