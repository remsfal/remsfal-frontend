<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  tenantContractService,
  type TenantContractStatus,
  type TenantContractSummary,
} from '@/services/TenantContractService.ts';

const mockContracts: TenantContractSummary[] = [
  {
    id: 'CNT-001',
    address: 'Hauptstr. 12, 70173 Stuttgart',
    leaseStart: '2022-04-01',
    leaseEnd: '2024-03-31',
    status: 'Active',
  },
  {
    id: 'CNT-002',
    address: 'Neckarweg 5, 70376 Stuttgart',
    leaseStart: '2021-06-15',
    leaseEnd: '2023-06-14',
    status: 'Active',
  },
  {
    id: 'CNT-003',
    address: 'Rosenstr. 8, 73728 Esslingen',
    leaseStart: '2019-01-01',
    leaseEnd: '2022-12-31',
    status: 'Expired',
  },
];

const contracts = ref<TenantContractSummary[]>(mockContracts);
const loading = ref(false);
const error = ref<string | null>(null);

const statusClasses = (status: TenantContractStatus) =>
  status === 'Active'
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-gray-100 text-gray-700 border-gray-200';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

const loadContracts = async () => {
  loading.value = true;
  error.value = null;

  try {
    const data = await tenantContractService.listContracts();
    const list = Array.isArray((data as any)?.contracts)
      ? (data as any).contracts
      : Array.isArray(data)
        ? data
        : [];
    if (list.length) {
      contracts.value = list;
    }
  } catch (err) {
    console.error(err);
    error.value = 'Verträge konnten nicht geladen werden. Anzeige mit Demo-Daten.';
  } finally {
    loading.value = false;
  }
};

onMounted(loadContracts);
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12 space-y-1">
        <h1 class="text-2xl font-semibold text-gray-900">Meine Mietverträge</h1>
        <p class="text-gray-600">
          Übersicht deiner Mietverhältnisse. Tippe auf einen Vertrag, um Details zu sehen.
        </p>
      </div>

      <div class="col-span-12">
        <div class="card">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <p class="text-sm text-gray-500">Aktive und abgelaufene Verträge</p>
              <p class="text-base text-gray-800">Direkt verknüpft mit deinem Account</p>
            </div>
            <span v-if="loading" class="text-sm text-gray-500">Lade Verträge …</span>
          </div>

          <div
            v-if="error"
            class="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {{ error }}
          </div>

          <div v-if="contracts.length" class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <RouterLink
              v-for="contract in contracts"
              :key="contract.id"
              :to="`/tenancies/contract/${contract.id}`"
              class="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div class="flex items-start justify-between gap-2">
                <h2 class="text-lg font-medium text-gray-900 group-hover:text-blue-700">
                  {{ contract.address }}
                </h2>
                <span
                  class="ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                  :class="statusClasses(contract.status)"
                >
                  {{ contract.status === 'Active' ? 'Aktiv' : 'Abgelaufen' }}
                </span>
              </div>

              <dl class="mt-3 space-y-1 text-sm text-gray-600">
                <div class="flex justify-between">
                  <dt class="font-medium text-gray-500">Vertragsnummer</dt>
                  <dd class="text-gray-900">{{ contract.id }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="font-medium text-gray-500">Beginn</dt>
                  <dd class="text-gray-900">{{ formatDate(contract.leaseStart) }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="font-medium text-gray-500">Ende</dt>
                  <dd class="text-gray-900">{{ formatDate(contract.leaseEnd) }}</dd>
                </div>
              </dl>
            </RouterLink>
          </div>

          <div
            v-else
            class="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-gray-500"
          >
            Keine Verträge gefunden.
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
