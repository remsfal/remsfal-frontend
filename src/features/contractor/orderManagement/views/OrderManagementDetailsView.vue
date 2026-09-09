<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Message from 'primevue/message';
import CardSkeletonRows from '@/components/CardSkeletonRows.vue';
import QuotationRequestDetailsCard from '../components/QuotationRequestDetailsCard.vue';
import ContractorOrderTimelineCard from '../components/ContractorOrderTimelineCard.vue';
import { quotationRequestService, type QuotationRequestJson } from
  '@/features/contractor/orderManagement/services/QuotationRequestService';

const props = defineProps<{ issueId: string }>();

const { t } = useI18n();

const loading = ref(false);
const error = ref<string | null>(null);
const request = ref<QuotationRequestJson | null>(null);

let fetchSequence = 0;

const fetchRequest = async () => {
  const currentFetch = ++fetchSequence;
  loading.value = true;
  error.value = null;

  try {
    const result = await quotationRequestService.getContractorQuotationRequests();
    if (currentFetch !== fetchSequence) return;
    const found = (result.items ?? []).find((item) => item.issueId === props.issueId) ?? null;
    request.value = found;
    if (!found) {
      error.value = t('orderManagement.quotationRequestDetails.notFound');
    }
  } catch (fetchError) {
    if (currentFetch !== fetchSequence) return;
    console.error('Error fetching quotation request:', fetchError);
    error.value = t('orderManagement.quotationRequestDetails.loadError');
  } finally {
    if (currentFetch === fetchSequence) {
      loading.value = false;
    }
  }
};

onMounted(fetchRequest);
watch(() => props.issueId, fetchRequest);
</script>

<template>
  <div class="flex flex-col gap-4">
    <Message v-if="error" severity="error" :closable="false">
      {{ error }}
    </Message>

    <CardSkeletonRows v-if="loading" :rows="4" />

    <template v-else-if="request">
      <QuotationRequestDetailsCard :request="request" />
      <ContractorOrderTimelineCard
        v-if="request.id"
        :issueId="props.issueId"
        :requestId="request.id"
        :title="t('tenantIssues.timeline.title')"
      />
    </template>
  </div>
</template>
