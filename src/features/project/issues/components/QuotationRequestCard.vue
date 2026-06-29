<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import BaseCard from '@/components/common/BaseCard.vue';
import NewQuotationRequestDialog from './NewQuotationRequestDialog.vue';
import { quotationRequestService, type QuotationRequestJson } from '@/services/QuotationRequestService';

const props = defineProps<{ projectId: string; issueId: string }>();

const { t } = useI18n();

const requests = ref<QuotationRequestJson[]>([]);

async function fetchRequests() {
  try {
    const result = await quotationRequestService.getQuotationRequests(props.issueId);
    requests.value = result.items ?? [];
  } catch (error) {
    console.error('Failed to fetch quotation requests:', error);
  }
}

onMounted(() => {
  fetchRequests();
});
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('quotationRequest.card.title') }}
    </template>
    <template #content>
      <DataTable :value="requests">
        <template #empty>
          <span class="text-muted-color">{{ t('quotationRequest.table.empty') }}</span>
        </template>
        <Column field="status" :header="t('quotationRequest.table.status')">
          <template #body="{ data }">
            {{ data.status ? t(`quotationRequest.status.${data.status}`) : '' }}
          </template>
        </Column>
        <Column field="contractorId" :header="t('quotationRequest.table.contractorId')" />
        <Column field="scopeOfWork" :header="t('quotationRequest.table.scopeOfWork')" />
        <Column field="createdAt" :header="t('quotationRequest.table.createdAt')" />
      </DataTable>
      <div class="flex justify-end mt-4">
        <NewQuotationRequestDialog
          :projectId="projectId"
          :issueId="issueId"
          @created="fetchRequests"
        />
      </div>
    </template>
  </BaseCard>
</template>
