<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import QuotationRequestsTable from './QuotationRequestsTable.vue';
import { quotationRequestService, type QuotationRequestJson } from '@/services/QuotationRequestService';

const { t } = useI18n();
const router = useRouter();

const requests = ref<QuotationRequestJson[]>([]);
const isLoading = ref(true);

const quotationRequests = computed(() =>
  requests.value.filter((r) => r.status === 'REQUESTED'),
);

async function fetchRequests() {
  isLoading.value = true;
  try {
    const result = await quotationRequestService.getContractorQuotationRequests();
    requests.value = result.items ?? [];
  } catch (error) {
    console.error('Failed to fetch quotation requests:', error);
  } finally {
    isLoading.value = false;
  }
}

function onRequestSelect(request: QuotationRequestJson) {
  if (!request.id) return;
  router.push({ name: 'ContractorOrderDetails', params: { requestId: request.id } });
}

onMounted(() => {
  fetchRequests();
});
</script>

<template>
  <BaseCard :loading="isLoading" :skeletonRows="4">
    <template #title>
      {{ t('orderManagement.quotationRequests.title') }}
    </template>
    <template #content>
      <QuotationRequestsTable :requests="quotationRequests" @rowSelect="onRequestSelect" />
    </template>
  </BaseCard>
</template>
