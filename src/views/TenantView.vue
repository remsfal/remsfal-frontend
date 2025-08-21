<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ContractorTable from '@/components/ContractorTable.vue';
import { tenancyService, type GetTenanciesResponse, type TenancyJson } from '@/services/TenancyService';

const tenanciesResponse = ref<GetTenanciesResponse | null>(null);
const loading = ref(true);

// Optional: fetch a single tenancy
const tenancyId = ref<string>('');
const rentalId = ref<string>('');
const tenancy = ref<TenancyJson | null>(null);

onMounted(async () => {
  try {
    tenanciesResponse.value = await tenancyService.fetchTenancies();

    if (tenancyId.value && rentalId.value) {
      tenancy.value = await tenancyService.fetchTenancy(tenancyId.value, rentalId.value);
    }
  } catch (err) {
    console.error('Failed to fetch tenancy data', err);
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

    <div v-if="tenancy" class="mt-6">
      <h6>Single Tenancy Details</h6>
      <p>ID: {{ tenancy.id }}</p>
      <p>Start of Rental: {{ tenancy.startOfRental }}</p>
      <p>End of Rental: {{ tenancy.endOfRental }}</p>
      <p>Active: {{ tenancy.active }}</p>
    </div>

    <div v-else-if="!loading">No tenancy data found.</div>
  </main>
</template>
