<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import BaseDialog from '@/components/common/BaseDialog.vue';
import DialogFormField from '@/components/common/DialogFormField.vue';
import { quotationRequestService, type CreateQuotationRequestJson } from '@/services/QuotationRequestService';
import { type ContractorJson, projectContractorService } from '@/services/ProjectContractorService';

const props = defineProps<{ projectId: string; issueId: string }>();
const emit = defineEmits<(e: 'created') => void>();

const { t } = useI18n();
const toast = useToast();

const visible = ref(false);
const contractors = ref<ContractorJson[]>([]);
const initialValues = ref({ scopeOfWork: '', contractors: [] as ContractorJson[] });

const validationSchema = z.object({
  scopeOfWork: z.string().trim().min(1, { message: t('quotationRequest.validation.scopeOfWork') }),
  contractors: z.array(z.any()).min(1, { message: t('quotationRequest.validation.contractors') }),
});

const resolver = zodResolver(validationSchema);

async function fetchContractors() {
  try {
    const result = await projectContractorService.getContractors(props.projectId);
    contractors.value = result.contractors ?? [];
  } catch (error) {
    console.error('Failed to fetch contractors:', error);
  }
}

onMounted(() => {
  fetchContractors();
});

function resetForm() {
  initialValues.value = { scopeOfWork: '', contractors: [] };
}

const onSubmit = async (event: FormSubmitEvent) => {
  if (!event.valid) return;

  const s = event.states;
  const data: CreateQuotationRequestJson = {
    scopeOfWork: s.scopeOfWork?.value?.trim(),
    contractors: s.contractors?.value ?? [],
  };

  try {
    await quotationRequestService.createQuotationRequest(props.issueId, data);
    visible.value = false;
    resetForm();
    emit('created');
    toast.add({
      severity: 'success',
      summary: t('quotationRequest.createSuccess'),
      life: 3000,
    });
  } catch (error) {
    console.error('Failed to create quotation request:', error instanceof Error ? error.message : error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('quotationRequest.createError'),
      life: 5000,
    });
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
        <DialogFormField
          inputId="scopeOfWork"
          :label="t('quotationRequest.dialog.scopeOfWork')"
          required
          :errorMessage="$form.scopeOfWork?.invalid && $form.scopeOfWork?.touched ? $form.scopeOfWork.error.message : undefined"
        >
          <Textarea
            id="scopeOfWork"
            name="scopeOfWork"
            :placeholder="t('quotationRequest.dialog.scopeOfWork.placeholder')"
            :class="{ 'p-invalid': $form.scopeOfWork?.invalid && $form.scopeOfWork?.touched }"
            rows="4"
            autoResize
            fluid
          />
        </DialogFormField>

        <DialogFormField
          inputId="contractors"
          :label="t('quotationRequest.dialog.contractors')"
          required
          :errorMessage="$form.contractors?.invalid && $form.contractors?.touched ? $form.contractors.error.message : undefined"
        >
          <MultiSelect
            id="contractors"
            name="contractors"
            :options="contractors"
            optionLabel="companyName"
            :placeholder="t('quotationRequest.dialog.contractors')"
            :class="{ 'p-invalid': $form.contractors?.invalid && $form.contractors?.touched }"
            display="chip"
            fluid
          />
        </DialogFormField>
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
