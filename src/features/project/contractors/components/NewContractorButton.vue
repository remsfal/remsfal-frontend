<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import BaseDialog from '@/components/common/BaseDialog.vue';
import PhoneInput from '@/components/common/PhoneInput.vue';
import { type ContractorJson, projectContractorService } from '@/services/ProjectContractorService';

const props = defineProps<{ projectId: string }>();
const emit = defineEmits<(e: 'newContractor', companyName: string) => void>();

const { t } = useI18n();
const toast = useToast();

const phoneRegex = /^\+[1-9]\d{4,14}$/;

const visible = ref(false);
const phone = ref('');
const initialValues = ref({
  companyName: '', email: '', contactPerson: '', trade: '', remarks: ''
});

const validationSchema = z.object({
  companyName: z.string().trim().min(1, { message: t('contractor.new.validation.name') }),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {message: t('contractor.new.validation.email'),}),
  contactPerson: z.string().trim().optional(),
  trade: z.string().trim().optional(),
  remarks: z.string().trim().optional(),
});

const resolver = zodResolver(validationSchema);

const phoneError = computed(() => {
  if (!phone.value) return null;
  return phoneRegex.test(phone.value) ? null : t('validation.phone');
});

function resetForm() {
  initialValues.value = {
    companyName: '', email: '', contactPerson: '', trade: '', remarks: ''
  };
  phone.value = '';
}

const onSubmit = async (event: FormSubmitEvent) => {
  if (!event.valid || phoneError.value) return;

  const s = event.states;
  const companyName = s.companyName?.value?.trim() ?? '';

  const contractor: ContractorJson = {
    companyName,
    email: s.email?.value?.trim() || undefined,
    phone: phone.value || undefined,
    contactPerson: s.contactPerson?.value?.trim() || undefined,
    trade: s.trade?.value?.trim() || undefined,
    remarks: s.remarks?.value?.trim() || undefined,
  };

  try {
    await projectContractorService.createContractor(props.projectId, contractor);
    visible.value = false;
    resetForm();
    emit('newContractor', companyName);
    toast.add({
      severity: 'success',
      summary: t('contractor.new.success'),
      detail: t('contractor.new.successDetail', [companyName]),
      life: 3000,
    });
  } catch (error) {
    console.error('Failed to create contractor:', error instanceof Error ? error.message : error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('contractor.new.error'),
      life: 5000,
    });
  }
};
</script>

<template>
  <Button
    :label="t('contractor.new.button')"
    icon="pi pi-plus"
    style="width: auto"
    @click="visible = true"
  />

  <BaseDialog
    v-model:visible="visible"
    :header="t('contractor.new.dialogTitle')"
    @hide="resetForm"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <label for="companyName" class="font-semibold">
            {{ t('contractor.new.companyName') }}<span aria-hidden="true"> *</span>
          </label>
          <InputText
            id="companyName"
            name="companyName"
            :placeholder="t('contractor.new.companyNamePlaceholder')"
            :class="{ 'p-invalid': $form.companyName?.invalid && $form.companyName?.touched }"
            autocomplete="off"
            autofocus
            fluid
          />
          <Message
            v-if="$form.companyName?.invalid && $form.companyName?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.companyName?.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <label for="email" class="font-semibold">{{ t('contractor.new.email') }}</label>
          <InputText
            id="email"
            name="email"
            type="email"
            :class="{ 'p-invalid': $form.email?.invalid && $form.email?.touched }"
            autocomplete="off"
            fluid
          />
          <Message
            v-if="$form.email?.invalid && $form.email?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.email?.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <label for="phone" class="font-semibold">{{ t('contractor.new.phone') }}</label>
          <PhoneInput
            :modelValue="phone"
            inputId="phone"
            @update:modelValue="(v) => (phone = v)"
          />
          <Message v-if="phoneError" severity="error" size="small" variant="simple">
            {{ phoneError }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <label for="contactPerson" class="font-semibold">{{ t('contractor.new.contactPerson') }}</label>
          <InputText id="contactPerson" name="contactPerson" fluid />
        </div>

        <div class="flex flex-col gap-1">
          <label for="trade" class="font-semibold">{{ t('contractor.new.trade') }}</label>
          <InputText id="trade" name="trade" fluid />
        </div>

        <div class="flex flex-col gap-1">
          <label for="remarks" class="font-semibold">{{ t('contractor.new.remarks') }}</label>
          <Textarea id="remarks" name="remarks" rows="3" fluid />
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button type="button" :label="t('button.cancel')" severity="secondary" @click="visible = false" />
        <Button
          type="submit"
          :label="t('button.add')"
          icon="pi pi-plus"
          :disabled="!$form.companyName?.valid || !$form.companyName?.dirty || !!phoneError"
        />
      </div>
    </Form>
  </BaseDialog>
</template>
