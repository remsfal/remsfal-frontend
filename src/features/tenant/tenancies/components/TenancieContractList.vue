<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

import { tenancyService, type TenancyJson } from '@/services/TenancyService';
import TenancieContractCard from './TenancieContractCard.vue';

const { t } = useI18n();

const contracts = ref<TenancyJson[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const loadContracts = async () => {
  loading.value = true;
  error.value = null;

  try {
    contracts.value = await tenancyService.getTenancies();
  } catch (err) {
    console.error(err);
    error.value = t('tenantDashboard.error');
    contracts.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(loadContracts);

</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <h1 class="col-span-12 mb-1 text-2xl font-semibold text-gray-900">
      {{ t('tenantDashboard.title') }}
    </h1>

    <div v-if="loading" class="col-span-12 flex items-center gap-2">
      <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="4" />
      <span class="text-sm text-gray-500">{{ t('tenantDashboard.loading') }}</span>
    </div>

    <div class="col-span-12">
      <Message v-if="error" severity="error" class="mb-4 mt-4" :closable="false">
        {{ error }}
      </Message>

      <div v-if="contracts.length" class="mt-6 grid content-start gap-5">
        <TenancieContractCard
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
    </div>
  </div>
</template>