<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { tenantContractService } from '@/services/TenantContractService.ts';
import type { TenantContractStatus, TenantContractSummary } from '@/services/TenantContractService.ts';
import Card from 'primevue/card';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';

const fallbackContracts: TenantContractSummary[] = [
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

const contracts = ref<TenantContractSummary[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const getSeverity = (status: TenantContractStatus) => {
  return status === 'Active' ? 'success' : 'secondary';
};

const getStatusLabel = (status: TenantContractStatus) => {
  return status === 'Active' ? 'Aktiv' : 'Abgelaufen';
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

const normalizeContracts = (
  data: TenantContractSummary[] | { contracts?: TenantContractSummary[] } | unknown,
): TenantContractSummary[] => {
    const contractsContainer = data as { contracts?: TenantContractSummary[] };
    if (Array.isArray(contractsContainer?.contracts)) {
      return contractsContainer.contracts!;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

const loadContracts = async () => {
  loading.value = true;
  error.value = null;

  try {
    const data = await tenantContractService.listContracts();
    const list = normalizeContracts(data);
    contracts.value = list;
  } catch (err) {
    console.error(err);
    error.value = 'Verträge konnten nicht geladen werden. Anzeige mit Demo-Daten.';
    contracts.value = fallbackContracts;
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
          Meine Mietverträge
        </h1>
        <p class="text-gray-600 mb-4">
          Übersicht deiner Mietverhältnisse. Tippe auf einen Vertrag, um Details zu sehen.
        </p>
      </div>

      <div class="col-span-12">
        <Card>
          <template #title>
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
              <div>
                <span class="text-xl font-semibold">Aktive und abgelaufene Verträge</span>
                <p class="text-base text-gray-500 font-normal mt-1">
                  Direkt verknüpft mit deinem Account
                </p>
              </div>
              <div v-if="loading" class="flex items-center gap-2">
                <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="4" />
                <span class="text-sm text-gray-500">Lade Verträge …</span>
              </div>
            </div>
          </template>

          <template #content>
            <Message v-if="error" severity="error" class="mb-4" :closable="false">
              {{ error }}
            </Message>

            <div
              v-if="contracts.length"
              class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mt-4"
            >
              <RouterLink
                v-for="contract in contracts"
                :key="contract.id"
                :to="`/tenancies/contract/${contract.id}`"
                class="no-underline"
                data-testid="contract-card"
              >
                <Card class="h-full hover:shadow-md transition-shadow cursor-pointer border border-gray-200 shadow-none">
                  <template #content>
                    <div class="flex items-start justify-between gap-2 mb-3">
                      <h2 class="text-lg font-medium text-gray-900">
                        {{ contract.address }}
                      </h2>
                      <Tag :value="getStatusLabel(contract.status)" :severity="getSeverity(contract.status)" rounded />
                    </div>

                    <dl class="space-y-1 text-sm text-gray-600">
                      <div class="flex justify-between">
                        <dt class="font-medium text-gray-500">
                          Vertragsnummer
                        </dt>
                        <dd class="text-gray-900">
                          {{ contract.id }}
                        </dd>
                      </div>
                      <div class="flex justify-between">
                        <dt class="font-medium text-gray-500">
                          Beginn
                        </dt>
                        <dd class="text-gray-900">
                          {{ formatDate(contract.leaseStart) }}
                        </dd>
                      </div>
                      <div class="flex justify-between">
                        <dt class="font-medium text-gray-500">
                          Ende
                        </dt>
                        <dd class="text-gray-900">
                          {{ formatDate(contract.leaseEnd) }}
                        </dd>
                      </div>
                    </dl>
                  </template>
                </Card>
              </RouterLink>
            </div>

            <div
              v-else-if="!loading"
              class="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-gray-500"
              data-testid="empty-state"
            >
              Keine Verträge gefunden.
            </div>
          </template>
        </Card>
      </div>
    </div>
  </main>
</template>
