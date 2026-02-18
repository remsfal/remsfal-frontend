<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { tenancyService, type TenancyJson } from '@/services/TenancyService';
import Card from 'primevue/card';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

const route = useRoute();

const contract = ref<TenancyJson | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const loadContract = async () => {
  const contractId = route.params.contractId as string;
  loading.value = true;
  error.value = null;

  try {
    // Load tenancy list to find the contract
    const tenancies = await tenancyService.getTenancies();
    const item = tenancies.find(t => t.agreementId === contractId);

    if (!item) {
      throw new Error('Vertrag nicht gefunden');
    }

    // TenancyJson doesn't have rentalId, so we can't fetch detailed data
    // Just use the summary data available in TenancyJson
    contract.value = item;
  } catch (err) {
    console.error(err);
    error.value = 'Vertragsdetails konnten nicht geladen werden.';
    contract.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(loadContract);
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12">
        <h1 class="text-2xl font-semibold text-gray-900 mb-1">
          Vertragsdetails
        </h1>
        <p class="text-gray-600 mb-4">
          Alle Informationen zu deinem Mietvertrag.
        </p>
      </div>

      <div class="col-span-12">
        <Card>
          <template #content>
            <div class="flex flex-col gap-1 mb-6">
              <p class="text-sm text-gray-500">
                Vertragsnummer {{ contract?.agreementId ?? route.params.contractId }}
              </p>
              <h2 class="text-xl font-semibold text-gray-900">
                {{ contract?.rentalUnits?.[0]?.location || contract?.rentalUnits?.[0]?.title || 'Lade Adresse …' }}
              </h2>
            </div>

            <Message v-if="error" severity="error" class="mb-4" :closable="false">
              {{ error }}
            </Message>

            <div v-if="loading && !contract" class="flex items-center gap-2 text-gray-500">
              <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="4" />
              Lade Vertragsdetails …
            </div>

            <div v-if="contract" class="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
              <div v-if="contract.rentalUnits?.[0]?.type" class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p class="text-sm font-medium text-gray-500">
                  Objekttyp
                </p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ contract.rentalUnits?.[0]?.type }}
                </p>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p class="text-sm font-medium text-gray-500">
                  Status
                </p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ contract.active ? 'Aktiv' : 'Inaktiv' }}
                </p>
              </div>
              <div v-if="contract.rentalUnits?.[0]?.title" class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p class="text-sm font-medium text-gray-500">
                  Objektbezeichnung
                </p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ contract.rentalUnits?.[0]?.title }}
                </p>
              </div>
            </div>

            <Message severity="info" :closable="false">
              Detaillierte Mietinformationen (Kaltmiete, Nebenkosten, etc.) sind derzeit nicht verfügbar.
              Diese Funktion wird in einer zukünftigen Version hinzugefügt.
            </Message>
          </template>
        </Card>
      </div>
    </div>
  </main>
</template>
