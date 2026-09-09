<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppToast } from '@/composables/useAppToast';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Textarea from 'primevue/textarea';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import BaseDialog from '@/components/BaseDialog.vue';
import { quotationRequestService } from '@/features/project/issues/services/QuotationRequestService';
import type { CreateQuotationRequestJson } from '@/features/project/issues/services/QuotationRequestService';
import { type ContractorJson, ContractorMultiSelect, NewContractorButton } from '@/features/project/contractors';
import { projectService } from '@/services/ProjectService';
import type { AddressJson } from '@/services/AddressService';

const props = defineProps<{ projectId: string; issueId: string }>();
const emit = defineEmits<(e: 'created') => void>();

const { t } = useI18n();
const appToast = useAppToast();

const visible = ref(false);
const contractorSelectRef = ref<InstanceType<typeof ContractorMultiSelect> | null>(null);
const selectedContractors = ref<ContractorJson[]>([]);
const contractorsTouched = ref(false);
const submitAttempted = ref(false);
const initialValues = ref({ scopeOfWork: '' });
const billingAddress = ref<AddressJson | undefined>(undefined);
const projectOwner = ref<string | undefined>(undefined);
const projectCareOf = ref<string | undefined>(undefined);

const contractorsInvalid = computed(
  () => (contractorsTouched.value || submitAttempted.value) && selectedContractors.value.length === 0,
);

const scopeOfWorkRequiredMessage = t('quotationRequest.validation.scopeOfWork');
const validationSchema = z.object({ scopeOfWork: z.string().trim().min(1, { message: scopeOfWorkRequiredMessage }) });

const resolver = zodResolver(validationSchema);

function onNewContractor(contractor: ContractorJson) {
  contractorSelectRef.value?.addContractor(contractor);
}

async function fetchBillingRecipientData() {
  try {
    const project = await projectService.getProject(props.projectId);
    projectOwner.value = project.owner;
    projectCareOf.value = project.careOf;
    billingAddress.value = project.billingAddress;
  } catch (error) {
    console.error('Failed to fetch billing recipient data:', error);
  }
}

async function ensureBillingRecipientDataLoaded() {
  if (projectOwner.value !== undefined || projectCareOf.value !== undefined || billingAddress.value !== undefined) {
    return;
  }
  await fetchBillingRecipientData();
}

onMounted(() => {
  fetchBillingRecipientData();
});

function resetForm() {
  initialValues.value = { scopeOfWork: '' };
  selectedContractors.value = [];
  contractorsTouched.value = false;
  submitAttempted.value = false;
}

const onSubmit = async (event: FormSubmitEvent) => {
  submitAttempted.value = true;
  if (!event.valid || selectedContractors.value.length === 0) return;
  await ensureBillingRecipientDataLoaded();

  const s = event.states;
  const data: CreateQuotationRequestJson = {
    scopeOfWork: s.scopeOfWork?.value?.trim(),
    contractors: selectedContractors.value,
    projectOwner: projectOwner.value,
    projectCareOf: projectCareOf.value,
    billingAddress: billingAddress.value,
  };

  try {
    await quotationRequestService.createQuotationRequest(props.issueId, data);
    visible.value = false;
    resetForm();
    emit('created');
    appToast.success(t('quotationRequest.createSuccess'));
  } catch (error) {
    console.error('Failed to create quotation request:', error instanceof Error ? error.message : error);
  }
};
</script>

<template>
  <Button
    :label="t('quotationRequest.newButton')"
    icon="pi pi-plus"
    style="width: auto"
    @click="visible = true"
  />

  <BaseDialog
    v-model:visible="visible"
    :header="t('quotationRequest.dialog.title')"
    dialogClass="w-full max-w-2xl"
    @hide="resetForm"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <label for="scopeOfWork" class="font-semibold">
            {{ t('quotationRequest.dialog.scopeOfWork') }}<span aria-hidden="true"> *</span>
          </label>
          <Textarea
            id="scopeOfWork"
            name="scopeOfWork"
            :placeholder="t('quotationRequest.dialog.scopeOfWork.placeholder')"
            :class="{ 'p-invalid': $form.scopeOfWork?.invalid && $form.scopeOfWork?.touched }"
            rows="4"
            autoResize
            fluid
          />
          <Message
            v-if="$form.scopeOfWork?.invalid && $form.scopeOfWork?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.scopeOfWork?.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <label for="contractors" class="font-semibold">
            {{ t('quotationRequest.dialog.contractors') }}<span aria-hidden="true"> *</span>
          </label>
          <div class="flex items-start gap-2">
            <ContractorMultiSelect
              ref="contractorSelectRef"
              v-model="selectedContractors"
              class="flex-1"
              inputId="contractors"
              :projectId="props.projectId"
              :invalid="contractorsInvalid"
              @blur="contractorsTouched = true"
            />
            <NewContractorButton :projectId="props.projectId" @newContractor="onNewContractor" />
          </div>
          <Message
            v-if="contractorsInvalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ t('quotationRequest.validation.contractors') }}
          </Message>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          :label="t('button.cancel')"
          severity="secondary"
          @click="visible = false"
        />
        <Button
          type="submit"
          :label="t('quotationRequest.dialog.submit')"
          icon="pi pi-send"
        />
      </div>
    </Form>
  </BaseDialog>
</template>
