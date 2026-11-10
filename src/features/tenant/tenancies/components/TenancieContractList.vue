<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Message from 'primevue/message';
import BaseCard from '@/components/BaseCard.vue';

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
  <BaseCard v-if="loading" loading :skeletonRows="4" data-testid="contracts-loading-skeleton" />

  <Message v-if="error" severity="error" :closable="false">
    {{ error }}
  </Message>

  <template v-if="contracts.length">
    <TenancieContractCard
      v-for="contract in contracts"
      :key="contract.agreementId"
      :contract="contract"
    />
  </template>

  <div
    v-else-if="!loading"
    class="rounded-lg border border-dashed border-surface bg-emphasis px-4 py-6 text-center text-muted-color"
    data-testid="empty-state"
  >
    {{ t('tenantDashboard.empty') }}
  </div>
</template>