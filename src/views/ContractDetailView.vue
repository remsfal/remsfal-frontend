<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { tenantContractService, type TenantContractDetail } from '@/services/TenantContractService.ts';
import Card from 'primevue/card';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Panel from 'primevue/panel';

const route = useRoute();

const fallbackContract: TenantContractDetail = {
  id: 'CNT-001',
  address: 'Hauptstr. 12, 70173 Stuttgart',
  monthlyRent: 980,
  deposit: 2400,
  leaseStart: '2022-04-01',
  leaseEnd: '2024-03-31',
  landlord: 'Remsfal Hausverwaltung GmbH',
  status: 'Active',
  documents: [
    { label: 'Mietvertrag (PDF)', url: '#' },
    { label: 'Übergabeprotokoll', url: '#' },
  ],
};

const contract = ref<TenantContractDetail | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);

const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

const leaseDuration = computed(() =>
  contract.value
    ? `${formatDate(contract.value.leaseStart)} – ${formatDate(contract.value.leaseEnd)}`
    : '',
);

const loadContract = async () => {
  const contractId = route.params.contractId as string;
  loading.value = true;
  error.value = null;

  try {
    const data = await tenantContractService.getContract(contractId);
    contract.value = {
      ...data,
      documents: data.documents ?? [],
    };
  } catch (err) {
    console.error(err);
    error.value = 'Vertragsdetails konnten nicht geladen werden. Anzeige mit Demo-Daten.';
    contract.value = fallbackContract;
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
                Vertragsnummer {{ contract?.id ?? route.params.contractId }}
              </p>
              <h2 class="text-xl font-semibold text-gray-900">
                {{ contract?.address ?? 'Lade Adresse …' }}
              </h2>
              <p v-if="contract" class="text-sm text-gray-500">
                Laufzeit: {{ leaseDuration }}
              </p>
            </div>

            <Message v-if="error" severity="warn" class="mb-4" :closable="false">
              {{ error }}
            </Message>

            <div v-if="loading && !contract" class="flex items-center gap-2 text-gray-500">
              <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="4" />
              Lade Vertragsdetails …
            </div>

            <div v-if="contract" class="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p class="text-sm font-medium text-gray-500">
                  Monatliche Miete
                </p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ formatCurrency(contract.monthlyRent) }}
                </p>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p class="text-sm font-medium text-gray-500">
                  Kaution
                </p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ formatCurrency(contract.deposit) }}
                </p>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p class="text-sm font-medium text-gray-500">
                  Laufzeit
                </p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ leaseDuration }}
                </p>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p class="text-sm font-medium text-gray-500">
                  Vermieter / Verwaltung
                </p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ contract.landlord }}
                </p>
              </div>
            </div>

            <Panel v-if="contract" header="Zugehörige Dokumente" toggleable>
              <ul class="space-y-2 text-sm m-0 p-0 list-none">
                <li v-for="(doc, idx) in contract.documents" :key="idx">
                  <a
                    :href="doc.url"
                    class="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                  >
                    {{ doc.label }}
                  </a>
                </li>
                <li v-if="!contract.documents || contract.documents.length === 0" class="text-gray-500">
                  Keine Dokumente vorhanden.
                </li>
              </ul>
            </Panel>
          </template>
        </Card>
      </div>
    </div>
  </main>
</template>
