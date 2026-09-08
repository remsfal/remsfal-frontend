<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppToast } from '@/composables/useAppToast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import BaseCard from '@/components/BaseCard.vue';
import { orderPlacementService } from '@/features/contractor/orderManagement/services/OrderPlacementService';
import type { OrderPlacementJson } from '@/features/contractor/orderManagement/services/OrderPlacementService';

const { t, d } = useI18n();
const appToast = useAppToast();

const placements = ref<OrderPlacementJson[]>([]);
const isLoading = ref(true);

const orderPlacementRequests = computed(() =>
  placements.value.filter((p) => p.status === 'PLACED'),
);

async function fetchOrderPlacements() {
  isLoading.value = true;
  try {
    const result = await orderPlacementService.getOrderPlacements();
    placements.value = result.items ?? [];
  } catch (error) {
    console.error('Failed to fetch order placements:', error);
  } finally {
    isLoading.value = false;
  }
}

async function updateStatus(placement: OrderPlacementJson, status: 'CONFIRMED' | 'REJECTED') {
  if (!placement.id) return;
  try {
    await orderPlacementService.updateOrderPlacementStatus(placement.id, status);
    appToast.success(t(status === 'CONFIRMED' ? 'orderPlacement.confirmSuccess' : 'orderPlacement.rejectSuccess'));
    await fetchOrderPlacements();
  } catch (error) {
    console.error('Failed to update order placement status:', error);
  }
}

onMounted(() => {
  fetchOrderPlacements();
});
</script>

<template>
  <BaseCard :loading="isLoading" :skeletonRows="4">
    <template #title>
      {{ t('orderManagement.orderPlacementRequests.title') }}
    </template>
    <template #content>
      <DataTable :value="orderPlacementRequests">
        <template #empty>
          <span class="text-muted-color">{{ t('orderManagement.orderPlacementRequests.empty') }}</span>
        </template>
        <Column field="status" :header="t('orderPlacement.table.status')">
          <template #body="{ data }">
            {{ data.status ? t(`orderPlacement.status.${data.status}`) : '' }}
          </template>
        </Column>
        <Column field="projectOwner" :header="t('orderPlacement.table.projectOwner')" />
        <Column field="createdAt" :header="t('orderPlacement.table.createdAt')">
          <template #body="{ data }">
            {{ data.createdAt ? d(new Date(data.createdAt), 'shortFormat') : '' }}
          </template>
        </Column>
        <Column :header="t('orderPlacement.table.actions')">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                :label="t('orderPlacement.confirmButton')"
                icon="pi pi-check"
                size="small"
                @click="updateStatus(data, 'CONFIRMED')"
              />
              <Button
                :label="t('orderPlacement.rejectButton')"
                icon="pi pi-times"
                size="small"
                severity="secondary"
                @click="updateStatus(data, 'REJECTED')"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </BaseCard>
</template>
