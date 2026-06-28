<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseCard from '@/components/common/BaseCard.vue';
import { quotationRequestService, type QuotationRequestJson } from '@/services/QuotationRequestService';

const { t } = useI18n();

const requests = ref<QuotationRequestJson[]>([]);

const openRequests = computed(() =>
  requests.value.filter((r) => r.status === 'REQUESTED'),
);

async function fetchRequests() {
  try {
    const result = await quotationRequestService.getContractorQuotationRequests();
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
      {{ t('offerManagement.openRequests.title') }}
    </template>
    <template #content>
      <DataTable :value="openRequests">
        <template #empty>
          <span class="text-muted-color">{{ t('offerManagement.openRequests.empty') }}</span>
        </template>
        <Column field="status" :header="t('quotationRequest.table.status')">
          <template #body="{ data }">
            {{ data.status ? t(`quotationRequest.status.${data.status}`) : '' }}
          </template>
        </Column>
        <Column field="scopeOfWork" :header="t('quotationRequest.table.scopeOfWork')" />
        <Column field="createdAt" :header="t('quotationRequest.table.createdAt')" />
      </DataTable>
    </template>
  </BaseCard>
</template>
