<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { tenancyService, type TenancyJson } from '@/services/TenancyService';
import Card from 'primevue/card';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';

const contracts = ref<TenancyJson[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const getTenancyStatus = (item: TenancyJson) => {
  // TenancyJsonJson doesn't have endOfRental field, use active status
  return item.active !== false ? 'Active' : 'Expired';
};

const getSeverity = (status: 'Active' | 'Expired') => {
  return status === 'Active' ? 'success' : 'secondary';
};

const getStatusLabel = (status: 'Active' | 'Expired') => {
  return status === 'Active' ? 'Aktiv' : 'Abgelaufen';
};

const loadContracts = async () => {
  loading.value = true;
  error.value = null;

  try {
    contracts.value = await tenancyService.getTenancies();
  } catch (err) {
    console.error(err);
    error.value = 'Verträge konnten nicht geladen werden.';
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
                :key="contract.agreementId"
                :to="`/tenancies/contract/${contract.agreementId}`"
                class="no-underline"
                data-testid="contract-card"
              >
                <Card class="h-full hover:shadow-md transition-shadow cursor-pointer border border-gray-200 shadow-none">
                  <template #content>
                    <div class="flex items-start justify-between gap-2 mb-3">
                      <h2 class="text-lg font-medium text-gray-900">
                        {{ contract.rentalUnits?.[0]?.location || contract.rentalUnits?.[0]?.title || 'Keine Adresse' }}
                      </h2>
                      <Tag
                        :value="getStatusLabel(getTenancyStatus(contract))"
                        :severity="getSeverity(getTenancyStatus(contract))"
                        rounded
                      />
                    </div>

                    <dl class="space-y-1 text-sm text-gray-600">
                      <div class="flex justify-between">
                        <dt class="font-medium text-gray-500">
                          Vertragsnummer
                        </dt>
                        <dd class="text-gray-900">
                          {{ contract.agreementId }}
                        </dd>
                      </div>
                      <div v-if="contract.rentalUnits?.[0]?.type" class="flex justify-between">
                        <dt class="font-medium text-gray-500">
                          Typ
                        </dt>
                        <dd class="text-gray-900">
                          {{ contract.rentalUnits?.[0]?.type }}
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
