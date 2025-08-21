<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ContractorTable from '@/components/ContractorTable.vue';
import { tenancyService, type GetTenanciesResponse } from '@/services/TenancyService';

const tenanciesResponse = ref<GetTenanciesResponse | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    tenanciesResponse.value = await tenancyService.fetchTenancies();
  } catch (err) {
    console.error('Failed to fetch tenancies', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-10">
        <div class="card">
          <h5>Übersicht aller Auftraggeber</h5>
          <ContractorTable
            :tenancies="tenanciesResponse?.tenancies ?? []"
            :loading="loading"
          />
        </div>
      </div>
    </div>
  </main>
</template>
