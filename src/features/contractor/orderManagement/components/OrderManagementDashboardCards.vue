<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import BaseCard from '@/components/common/BaseCard.vue';
import { quotationRequestService, type QuotationRequestJson } from '@/services/QuotationRequestService';
import { orderPlacementService, type OrderPlacementJson } from '@/services/OrderPlacementService';

const { t, d } = useI18n();
const router = useRouter();
const toast = useToast();

const isLoading = ref(true);
const newQuotationRequests = ref<QuotationRequestJson[]>([]);
const newOrders = ref<OrderPlacementJson[]>([]);

function reportLoadError() {
  toast.add({
    severity: 'error',
    summary: t('error.general'),
    detail: t('orderManagement.dashboard.loadError'),
    life: 6000,
  });
}

function byNewest(a: { createdAt?: string }, b: { createdAt?: string }): number {
  return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
}

async function loadQuotationRequests(): Promise<QuotationRequestJson[]> {
  try {
    const result = await quotationRequestService.getContractorQuotationRequests();
    return (result.items ?? []).filter((r) => r.status === 'REQUESTED').sort(byNewest).slice(0, 5);
  } catch {
    reportLoadError();
    return [];
  }
}

async function loadOrders(): Promise<OrderPlacementJson[]> {
  try {
    const result = await orderPlacementService.getOrderPlacements();
    return (result.items ?? []).filter((p) => p.status === 'PLACED').sort(byNewest).slice(0, 5);
  } catch {
    reportLoadError();
    return [];
  }
}

async function loadData() {
  isLoading.value = true;
  const [quotationRequests, orders] = await Promise.all([loadQuotationRequests(), loadOrders()]);
  newQuotationRequests.value = quotationRequests;
  newOrders.value = orders;
  isLoading.value = false;
}

function goToOpenOrders() {
  router.push({ name: 'ContractorOrdersOpen' });
}

onMounted(() => loadData());
</script>

<template>
  <div class="mb-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
    <BaseCard :loading="isLoading" :skeletonRows="5">
      <template #title>
        {{ t('orderManagement.dashboard.newQuotationRequests') }}
      </template>
      <template #content>
        <div v-if="newQuotationRequests.length === 0" class="text-muted-color text-sm">
          {{ t('orderManagement.quotationRequests.empty') }}
        </div>
        <DataTable
          v-else
          :value="newQuotationRequests"
          selectionMode="single"
          :metaKeySelection="false"
          :showHeaders="false"
          @rowSelect="goToOpenOrders"
        >
          <Column field="scopeOfWork">
            <template #body="{ data }">
              <span class="font-medium truncate">{{ data.scopeOfWork }}</span>
            </template>
          </Column>
          <Column field="createdAt">
            <template #body="{ data }">
              <span class="text-muted-color text-sm">
                {{ data.createdAt ? d(new Date(data.createdAt), 'shortFormat') : '' }}
              </span>
            </template>
          </Column>
        </DataTable>
      </template>
    </BaseCard>

    <BaseCard :loading="isLoading" :skeletonRows="5">
      <template #title>
        {{ t('orderManagement.dashboard.newOrders') }}
      </template>
      <template #content>
        <div v-if="newOrders.length === 0" class="text-muted-color text-sm">
          {{ t('orderManagement.orderPlacementRequests.empty') }}
        </div>
        <DataTable
          v-else
          :value="newOrders"
          selectionMode="single"
          :metaKeySelection="false"
          :showHeaders="false"
          @rowSelect="goToOpenOrders"
        >
          <Column field="projectOwner">
            <template #body="{ data }">
              <span class="font-medium truncate">{{ data.projectOwner }}</span>
            </template>
          </Column>
          <Column field="createdAt">
            <template #body="{ data }">
              <span class="text-muted-color text-sm">
                {{ data.createdAt ? d(new Date(data.createdAt), 'shortFormat') : '' }}
              </span>
            </template>
          </Column>
        </DataTable>
      </template>
    </BaseCard>
  </div>
</template>
