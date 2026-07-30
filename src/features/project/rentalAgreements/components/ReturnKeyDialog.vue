<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent, FormFieldState } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import BaseDialog from '@/components/common/BaseDialog.vue';
import { toISODateString } from '@/helper/dataHelper';
import type { RentalAgreementKeysJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';

const props = defineProps<{
  keys: RentalAgreementKeysJson[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  keyReturned: [payload: { keyDescription: string; returnedAt: string; amount: number }];
}>();

const { t } = useI18n();
const visible = ref(false);
const formKey = ref(0);

const outstandingTotals = computed(() => {
  const totals = new Map<string, number>();
  for (const key of props.keys) {
    if (!key.keyDescription) continue;
    totals.set(key.keyDescription, (totals.get(key.keyDescription) ?? 0) + key.amountOfKeys);
  }
  return totals;
});

const outstandingDescriptions = computed(() => Array.from(outstandingTotals.value.keys()).sort());

const triggerDisabled = computed(() => !!props.disabled);

function maxForDescription(description?: string | null): number | undefined {
  if (!description) return undefined;
  return outstandingTotals.value.get(description);
}

function returnAllKeys(form: Record<string, FormFieldState>) {
  const max = maxForDescription(form.keyDescription?.value);
  if (!max || !form.amount) return;

  form.amount.value = max;
  if (form.returnedAt && !form.returnedAt.value) {
    form.returnedAt.value = new Date();
  }
}

const schema = z
  .object({
    keyDescription: z.string().min(1, { message: t('validation.required') }),
    amount: z
      .number({ message: t('returnKeyDialog.amountRequired') })
      .int()
      .min(1, { message: t('returnKeyDialog.amountRequired') }),
    returnedAt: z
      .union([z.string(), z.date()])
      .refine((val) => val !== null && val !== undefined && val !== '', { message: t('validation.required') }),
  })
  .refine((data) => data.amount <= (maxForDescription(data.keyDescription) ?? 0), {
    message: t('returnKeyDialog.amountExceedsOutstanding'),
    path: ['amount'],
  });
const resolver = zodResolver(schema);

const initialValues = ref({
  keyDescription: '',
  amount: null as number | null,
  returnedAt: null as Date | null,
});

function openDialog() {
  visible.value = true;
}

function resetForm() {
  initialValues.value = {
    keyDescription: '', amount: null, returnedAt: null 
  };
  formKey.value += 1;
}

function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;

  const formState = event.states;
  const returnedAt = toISODateString(formState.returnedAt?.value);
  if (!returnedAt) return;

  emit('keyReturned', {
    keyDescription: formState.keyDescription?.value,
    amount: formState.amount?.value,
    returnedAt,
  });

  resetForm();
  visible.value = false;
}

function onCancel() {
  resetForm();
  visible.value = false;
}
</script>

<template>
  <Button
    type="button"
    :label="t('returnKeyDialog.dialogTitle')"
    icon="pi pi-pencil"
    severity="secondary"
    :disabled="triggerDisabled"
    @click="openDialog"
  />

  <BaseDialog v-model:visible="visible" :closable="false" :header="t('returnKeyDialog.dialogTitle')">
    <Form
      :key="formKey" v-slot="$form"
      :initialValues :resolver
      @submit="onSubmit"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="keyDescription" class="font-semibold">
            {{ t('returnKeyDialog.descriptionLabel') }} *
          </label>
          <Select
            inputId="keyDescription"
            name="keyDescription"
            :options="outstandingDescriptions"
            :placeholder="t('returnKeyDialog.descriptionPlaceholder')"
            :class="{ 'p-invalid': $form.keyDescription?.invalid && $form.keyDescription?.touched }"
            fluid
          />
          <Message
            v-if="$form.keyDescription?.invalid && $form.keyDescription?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.keyDescription.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label for="amount" class="font-semibold">
              {{ t('returnKeyDialog.amountLabel') }} *
            </label>
            <Button
              type="button"
              :label="t('returnKeyDialog.returnAllButton')"
              text
              size="small"
              :disabled="!$form.keyDescription?.value"
              @click="returnAllKeys($form)"
            />
          </div>
          <InputNumber
            inputId="amount"
            name="amount"
            :min="1"
            :max="maxForDescription($form.keyDescription?.value)"
            showButtons
            fluid
            :class="{ 'p-invalid': $form.amount?.invalid && $form.amount?.touched }"
          />
          <small v-if="$form.keyDescription?.value" class="text-gray-500">
            {{ t('returnKeyDialog.amountHint', { max: maxForDescription($form.keyDescription?.value) }) }}
          </small>
          <Message
            v-if="$form.amount?.invalid && $form.amount?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.amount.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <label for="returnedAt" class="font-semibold">
            {{ t('returnKeyDialog.returnedAtLabel') }} *
          </label>
          <DatePicker
            inputId="returnedAt"
            name="returnedAt"
            dateFormat="dd.mm.yy"
            showIcon
            fluid
            :class="{ 'p-invalid': $form.returnedAt?.invalid && $form.returnedAt?.touched }"
          />
          <Message
            v-if="$form.returnedAt?.invalid && $form.returnedAt?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.returnedAt.error?.message }}
          </Message>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <Button type="button" :label="t('button.cancel')" severity="secondary" @click="onCancel" />
        <Button
          type="submit"
          :label="t('returnKeyDialog.confirmReturn')"
          icon="pi pi-check"
          :disabled="!$form.keyDescription?.value || !$form.amount?.value || !$form.returnedAt?.value"
        />
      </div>
    </Form>
  </BaseDialog>
</template>
