<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import BaseCard from '@/components/BaseCard.vue';
import {orderPlacementService,
  type OrderPlacementJson,} from '@/features/contractor/orderManagement/services/OrderPlacementService';

const { t, d } = useI18n();
const router = useRouter();

const ongoingOrders = ref<OrderPlacementJson[]>([]);
const isLoading = ref(true);

async function fetchOngoingOrders() {
  isLoading.value = true;
  try {
    const result = await orderPlacementService.getOrderPlacements(['CONFIRMED']);
    ongoingOrders.value = result.items ?? [];
  } catch (error) {
    console.error('Failed to fetch ongoing orders:', error);
  } finally {
    isLoading.value = false;
  }
}

function openOrderDetails(event: DataTableRowClickEvent) {
  const placement = event.data as OrderPlacementJson;
  if (!placement.issueId) return;
  router.push({ name: 'ContractorOrderDetails', params: { issueId: placement.issueId } });
}

onMounted(() => fetchOngoingOrders());
</script>

<template>
  <BaseCard :loading="isLoading" :skeletonRows="4">
    <template #title>
      {{ t('orderManagement.ongoingOrders.title') }}
    </template>
    <template #content>
      <DataTable :value="ongoingOrders" rowHover @rowClick="openOrderDetails">
        <template #empty>
          <span class="text-muted-color">{{ t('orderManagement.ongoingOrders.empty') }}</span>
        </template>
        <Column field="projectOwner" :header="t('orderPlacement.table.projectOwner')" />
        <Column field="contractorName" :header="t('orderPlacement.table.organization')" />
        <Column field="createdAt" :header="t('orderPlacement.table.createdAt')">
          <template #body="{ data }">
            {{ data.createdAt ? d(new Date(data.createdAt), 'shortFormat') : '' }}
          </template>
        </Column>
        <Column field="confirmedBy" :header="t('orderPlacement.table.confirmedBy')" />
      </DataTable>
    </template>
  </BaseCard>
</template>
