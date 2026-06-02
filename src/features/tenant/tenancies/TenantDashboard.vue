<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { tenancyService, type TenancyJson } from '@/services/TenancyService';
import TenancyDashboardCard from './components/TenancyDashboardCard.vue';

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
  <main>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12">
        <h1 class="text-2xl font-semibold text-gray-900 mb-1">
          {{ t('tenantDashboard.title') }}
        </h1>
      </div>

      <div class="col-span-12">
        <TenancyDashboardCard :contracts="contracts" :loading="loading" :error="error" />
      </div>
    </div>
  </main>
</template>
