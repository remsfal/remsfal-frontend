<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Message from 'primevue/message';
import KpiCard from '@/components/common/KpiCard.vue';
import { quotationRequestService, type QuotationRequestJson } from '@/services/QuotationRequestService';

const { t } = useI18n();
const toast = useToast();

const requests = ref<QuotationRequestJson[]>([]);
const isLoading = ref(true);

const requestedCount = computed(() => requests.value.filter((r) => r.status === 'REQUESTED').length);
const viewingRequiredCount = computed(() => requests.value.filter((r) => r.status === 'VIEWING_REQUIRED').length);
const consultationRequiredCount = computed(
  () => requests.value.filter((r) => r.status === 'CONSULTATION_REQUIRED').length,
);
const submittedCount = computed(() => requests.value.filter((r) => r.status === 'SUBMITTED').length);
const hasData = computed(() => requests.value.length > 0);

async function fetchQuotationRequests() {
  try {
    const result = await quotationRequestService.getContractorQuotationRequests();
    requests.value = result.items ?? [];
  } catch {
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('quotationRequest.kpi.loadError'),
      life: 6000,
    });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => fetchQuotationRequests());
</script>

<template>
  <Message v-if="!isLoading && !hasData" severity="success" closable class="mb-6">
    <template #icon>
      <i class="pi pi-sparkles text-xl" />
    </template>
    <span>
      {{ t('quotationRequest.kpi.emptyState.text') }}
      <br>
      <RouterLink
        :to="{ name: 'ContractorOrdersOpen' }"
        class="font-semibold underline"
      >
        {{ t('quotationRequest.kpi.emptyState.link') }}
      </RouterLink>
    </span>
  </Message>
  <div v-else class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <template v-if="isLoading">
      <KpiCard v-for="i in 4" :key="i" loading />
    </template>
    <template v-else>
      <KpiCard
        v-if="requestedCount > 0"
        icon="pi pi-inbox"
        :title="t('quotationRequest.status.REQUESTED')"
        :value="requestedCount"
        iconBackground="var(--color-orange-600)"
      />
      <KpiCard
        v-if="viewingRequiredCount > 0"
        icon="pi pi-eye"
        :title="t('quotationRequest.status.VIEWING_REQUIRED')"
        :value="viewingRequiredCount"
        iconBackground="var(--color-orange-600)"
      />
      <KpiCard
        v-if="consultationRequiredCount > 0"
        icon="pi pi-comments"
        :title="t('quotationRequest.status.CONSULTATION_REQUIRED')"
        :value="consultationRequiredCount"
        iconBackground="var(--color-orange-600)"
      />
      <KpiCard
        v-if="submittedCount > 0"
        icon="pi pi-send"
        :title="t('quotationRequest.status.SUBMITTED')"
        :value="submittedCount"
      />
    </template>
  </div>
</template>
