<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import BaseCard from '@/components/common/BaseCard.vue';
import { orderPlacementService, type OrderPlacementJson } from '@/services/OrderPlacementService';

const { t, d } = useI18n();
const toast = useToast();

const placements = ref<OrderPlacementJson[]>([]);

const orderPlacementRequests = computed(() =>
  placements.value.filter((p) => p.status === 'PLACED'),
);

async function fetchOrderPlacements() {
  try {
    const result = await orderPlacementService.getOrderPlacements();
    placements.value = result.items ?? [];
  } catch (error) {
    console.error('Failed to fetch order placements:', error);
  }
}

async function updateStatus(placement: OrderPlacementJson, status: 'CONFIRMED' | 'REJECTED') {
  if (!placement.id) return;
  try {
    await orderPlacementService.updateOrderPlacementStatus(placement.id, status);
    toast.add({
      severity: 'success',
      summary: t(status === 'CONFIRMED' ? 'orderPlacement.confirmSuccess' : 'orderPlacement.rejectSuccess'),
      life: 3000,
    });
    await fetchOrderPlacements();
  } catch (error) {
    console.error('Failed to update order placement status:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('orderPlacement.actionError'),
      life: 5000,
    });
  }
}

onMounted(() => {
  fetchOrderPlacements();
});
</script>

<template>
  <BaseCard>
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
