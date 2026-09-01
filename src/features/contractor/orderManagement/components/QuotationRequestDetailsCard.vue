<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Tag from 'primevue/tag';
import BaseCard from '@/components/common/BaseCard.vue';
import type { QuotationRequestJson } from '@/services/QuotationRequestService';

const props = defineProps<{ request: QuotationRequestJson }>();

const { t, d } = useI18n();

const dateLabel = (value?: string) => (value ? d(new Date(value), 'shortDateTime') : '');

const billingAddress = computed(() =>
  [props.request.projectBillingAddress1, props.request.projectBillingAddress2, props.request.projectBillingAddress3]
    .filter((line) => !!line)
    .join(', '),
);
</script>

<template>
  <BaseCard>
    <template #title>
      <div class="flex items-center justify-between gap-2">
        <span>{{ t('orderManagement.quotationRequestDetails.title') }}</span>
        <Tag v-if="request.status" :value="t(`quotationRequest.status.${request.status}`)" />
      </div>
    </template>
    <template #content>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div class="flex flex-col gap-1">
          <label for="quotation-request-id" class="text-sm text-gray-600">
            {{ t('orderManagement.quotationRequestDetails.fields.id') }}
          </label>
          <InputText id="quotation-request-id" :modelValue="request.id" disabled fluid />
        </div>

        <div class="flex flex-col gap-1">
          <label for="quotation-request-contractor-name" class="text-sm text-gray-600">
            {{ t('orderManagement.quotationRequestDetails.fields.contractorName') }}
          </label>
          <InputText id="quotation-request-contractor-name" :modelValue="request.contractorName" disabled fluid />
        </div>

        <div class="flex flex-col gap-1">
          <label for="quotation-request-project-owner" class="text-sm text-gray-600">
            {{ t('orderManagement.quotationRequestDetails.fields.projectOwner') }}
          </label>
          <InputText id="quotation-request-project-owner" :modelValue="request.projectOwner" disabled fluid />
        </div>

        <div class="flex flex-col gap-1">
          <label for="quotation-request-project-care-of" class="text-sm text-gray-600">
            {{ t('orderManagement.quotationRequestDetails.fields.projectCareOf') }}
          </label>
          <InputText id="quotation-request-project-care-of" :modelValue="request.projectCareOf" disabled fluid />
        </div>

        <div class="flex flex-col gap-1 lg:col-span-2">
          <label for="quotation-request-billing-address" class="text-sm text-gray-600">
            {{ t('orderManagement.quotationRequestDetails.fields.billingAddress') }}
          </label>
          <InputText id="quotation-request-billing-address" :modelValue="billingAddress" disabled fluid />
        </div>

        <div class="flex flex-col gap-1 lg:col-span-2">
          <label for="quotation-request-scope-of-work" class="text-sm text-gray-600">
            {{ t('orderManagement.quotationRequestDetails.fields.scopeOfWork') }}
          </label>
          <Textarea
            id="quotation-request-scope-of-work" :modelValue="request.scopeOfWork"
            disabled rows="3"
            fluid
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="quotation-request-initiated-by" class="text-sm text-gray-600">
            {{ t('orderManagement.quotationRequestDetails.fields.initiatedBy') }}
          </label>
          <InputText id="quotation-request-initiated-by" :modelValue="request.initiatedBy" disabled fluid />
        </div>

        <div class="flex flex-col gap-1">
          <label for="quotation-request-created-at" class="text-sm text-gray-600">
            {{ t('orderManagement.quotationRequestDetails.fields.createdAt') }}
          </label>
          <InputText id="quotation-request-created-at" :modelValue="dateLabel(request.createdAt)" disabled fluid />
        </div>

        <div class="flex flex-col gap-1">
          <label for="quotation-request-modified-at" class="text-sm text-gray-600">
            {{ t('orderManagement.quotationRequestDetails.fields.modifiedAt') }}
          </label>
          <InputText id="quotation-request-modified-at" :modelValue="dateLabel(request.modifiedAt)" disabled fluid />
        </div>
      </div>
    </template>
  </BaseCard>
</template>
