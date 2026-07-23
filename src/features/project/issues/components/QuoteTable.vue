<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { quotationService, type QuotationJson } from '@/features/project/issues/services/QuotationService';
import { orderPlacementService } from '@/services/OrderPlacementService';

const props = defineProps<{ issueId: string }>();

const { t, d } = useI18n();
const toast = useToast();

const quotations = ref<QuotationJson[]>([]);

async function fetchQuotations() {
  try {
    const result = await quotationService.getQuotations(props.issueId);
    quotations.value = result.items ?? [];
  } catch (error) {
    console.error('Failed to fetch quotations:', error);
  }
}

async function placeOrder(quotation: QuotationJson) {
  if (!quotation.id) return;
  try {
    await orderPlacementService.placeOrder(props.issueId, quotation.id);
    toast.add({
      severity: 'success',
      summary: t('quotation.placeOrderSuccess'),
      life: 3000,
    });
    await fetchQuotations();
  } catch (error) {
    console.error('Failed to place order:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('quotation.placeOrderError'),
      life: 5000,
    });
  }
}

onMounted(() => {
  fetchQuotations();
});
</script>

<template>
  <DataTable :value="quotations">
    <template #empty>
      <span class="text-muted-color">{{ t('quotation.table.empty') }}</span>
    </template>
    <Column field="status" :header="t('quotation.table.status')">
      <template #body="{ data }">
        {{ data.status ? t(`quotation.status.${data.status}`) : '' }}
      </template>
    </Column>
    <Column field="contractorName" :header="t('quotation.table.contractorName')" />
    <Column field="createdAt" :header="t('quotation.table.createdAt')">
      <template #body="{ data }">
        {{ data.createdAt ? d(new Date(data.createdAt), 'shortFormat') : '' }}
      </template>
    </Column>
    <Column field="validUntil" :header="t('quotation.table.validUntil')">
      <template #body="{ data }">
        {{ data.validUntil ? d(new Date(data.validUntil), 'shortFormat') : '' }}
      </template>
    </Column>
    <Column :header="t('quotation.table.actions')">
      <template #body="{ data }">
        <Button
          v-if="data.status === 'VALID'"
          :label="t('quotation.placeOrderButton')"
          icon="pi pi-check"
          size="small"
          @click="placeOrder(data)"
        />
      </template>
    </Column>
  </DataTable>
</template>
