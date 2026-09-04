<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseCard from '@/components/BaseCard.vue';
import type { QuotationRequestJson } from '@/services/QuotationRequestService';

const props = defineProps<{ request: QuotationRequestJson }>();

const { t, d } = useI18n();

const dateLabel = (value?: string) => (value ? d(new Date(value), 'shortDateTime') : null);

const statusLabel = computed(() =>
  props.request.status ? t(`quotationRequest.status.${props.request.status}`) : null,
);

const requestNumber = computed(() => {
  const id = props.request.id;
  return id?.split('-').pop() || id || '—';
});

const ticketNumber = computed(() => props.request.issueId || '—');

const billingAddress = computed(() =>
  [props.request.projectBillingAddress1, props.request.projectBillingAddress2, props.request.projectBillingAddress3]
    .filter((line) => !!line)
    .join(', ') || null,
);

const createdAtLabel = computed(() => dateLabel(props.request.createdAt));
</script>

<template>
  <BaseCard>
    <template #title>
      <div class="flex flex-col gap-1 border-b border-gray-200">
        <div class="flex flex-wrap items-baseline justify-between gap-3">
          <span class="text-xl font-semibold">{{ t('orderManagement.quotationRequestDetails.title') }}</span>
          <span v-if="request.projectCareOf" class="text-base text-gray-900 font-normal text-right shrink-0">
            {{ request.projectCareOf }}
          </span>
        </div>
        <div class="flex flex-wrap items-baseline justify-between gap-3">
          <p class="text-base text-gray-500 font-normal">
            {{ t('orderManagement.quotationRequestDetails.fields.ticketNumber') }} {{ ticketNumber }}
          </p>
          <span v-if="billingAddress" class="text-base text-gray-900 font-normal text-right shrink-0">
            {{ billingAddress }}
          </span>
        </div>
      </div>
    </template>
    <template #content>
      <div class="grid grid-cols-1 gap-4 lg:min-[1000px]:grid-cols-2 xl:grid-cols-3">
        <dl class="space-y-2 text-base text-gray-600">
          <div v-if="statusLabel" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('orderManagement.quotationRequestDetails.fields.status') }}
            </dt>
            <dd class="text-gray-900">
              {{ statusLabel }}
            </dd>
          </div>
          <div v-if="createdAtLabel" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('orderManagement.quotationRequestDetails.fields.createdAt') }}
            </dt>
            <dd class="text-gray-900">
              {{ createdAtLabel }}
            </dd>
          </div>
        </dl>
        <dl class="space-y-2 text-base text-gray-600">
          <div v-if="request.contractorName" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('orderManagement.quotationRequestDetails.fields.contractorName') }}
            </dt>
            <dd class="text-gray-900 break-words">
              {{ request.contractorName }}
            </dd>
          </div>
          <div v-if="requestNumber" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('orderManagement.quotationRequestDetails.fields.requestNumber') }}
            </dt>
            <dd class="text-gray-900">
              {{ requestNumber }}
            </dd>
          </div>
        </dl>
        <dl class="space-y-2 text-base text-gray-600">
          <div v-if="request.projectOwner" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('orderManagement.quotationRequestDetails.fields.projectOwner') }}
            </dt>
            <dd class="text-gray-900 break-words">
              {{ request.projectOwner }}
            </dd>
          </div>
          <div v-if="request.initiatedBy" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('orderManagement.quotationRequestDetails.fields.initiatedBy') }}
            </dt>
            <dd class="text-gray-900 break-words">
              {{ request.initiatedBy }}
            </dd>
          </div>
        </dl>
      </div>
      <div v-if="request.scopeOfWork" class="mt-4 text-base text-gray-600">
        {{ t('orderManagement.quotationRequestDetails.fields.scopeOfWork') }}
        <span class="text-gray-900 whitespace-pre-line break-words">
          {{ request.scopeOfWork }}
        </span>
      </div>
    </template>
  </BaseCard>
</template>
