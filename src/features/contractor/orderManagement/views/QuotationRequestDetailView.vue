<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import QuotationRequestDetailsCard from '../components/QuotationRequestDetailsCard.vue';
import ContractorOrderTimelineCard from '../components/ContractorOrderTimelineCard.vue';
import { quotationRequestService, type QuotationRequestJson } from '@/services/QuotationRequestService';

const props = defineProps<{ requestId: string }>();

const { t } = useI18n();

const loading = ref(false);
const error = ref<string | null>(null);
const request = ref<QuotationRequestJson | null>(null);

const fetchRequest = async () => {
  loading.value = true;
  error.value = null;

  try {
    const result = await quotationRequestService.getContractorQuotationRequests();
    const found = (result.items ?? []).find((item) => item.id === props.requestId) ?? null;
    request.value = found;
    if (!found) {
      error.value = t('orderManagement.quotationRequestDetails.notFound');
    }
  } catch (fetchError) {
    console.error('Error fetching quotation request:', fetchError);
    error.value = t('orderManagement.quotationRequestDetails.loadError');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRequest);
watch(() => props.requestId, fetchRequest);
</script>

<template>
  <div class="flex flex-col gap-4">
    <Message v-if="error" severity="error" :closable="false">
      {{ error }}
    </Message>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
    </div>

    <template v-else-if="request">
      <QuotationRequestDetailsCard :request="request" />
      <div class="flex flex-col gap-4 md:flex-row">
        <ContractorOrderTimelineCard
          class="md:flex-1"
          :requestId="props.requestId"
          recipient="TENANT"
          :title="t('orderManagement.timeline.tenantPanelTitle')"
          :attachments="request.attachments ?? []"
        />
        <ContractorOrderTimelineCard
          class="md:flex-1"
          :requestId="props.requestId"
          recipient="MANAGER"
          :title="t('orderManagement.timeline.managerPanelTitle')"
          :attachments="request.attachments ?? []"
        />
      </div>
    </template>
  </div>
</template>
