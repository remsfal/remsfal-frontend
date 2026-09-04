<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import type { QuotationRequestJson } from '@/services/QuotationRequestService';

const props = defineProps<{ requests: QuotationRequestJson[] }>();

const emit = defineEmits<{
  rowSelect: [request: QuotationRequestJson];
}>();

const { t, d } = useI18n();

const onRowSelect = (event: { data: QuotationRequestJson }) => {
  emit('rowSelect', event.data);
};
</script>

<template>
  <DataTable
    :value="props.requests"
    selectionMode="single"
    :metaKeySelection="false"
    @rowSelect="onRowSelect"
  >
    <template #empty>
      <span class="text-muted-color">{{ t('orderManagement.quotationRequests.empty') }}</span>
    </template>
    <Column field="status" :header="t('quotationRequest.table.status')">
      <template #body="{ data }">
        {{ data.status ? t(`quotationRequest.status.${data.status}`) : '' }}
      </template>
    </Column>
    <Column field="scopeOfWork" :header="t('quotationRequest.table.scopeOfWork')" />
    <Column field="createdAt" :header="t('quotationRequest.table.createdAt')">
      <template #body="{ data }">
        {{ data.createdAt ? d(new Date(data.createdAt), 'shortFormat') : '' }}
      </template>
    </Column>
  </DataTable>
</template>
