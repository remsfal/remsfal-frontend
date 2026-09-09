<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import AutoComplete from 'primevue/autocomplete';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import BaseDialog from '@/components/BaseDialog.vue';
import { toISODateString } from '@/helper/dateHelper';
import type { RentalAgreementKeysJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';

const props = defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  newKey: [key: RentalAgreementKeysJson];
}>();

const { t } = useI18n();
const visible = ref(false);
const issuedAtValue = ref<Date | null>(null);
const formKey = ref(0);
const issuedAtTouched = ref(false);
const submitAttempted = ref(false);
const filteredDescriptions = ref<string[]>([]);

function getCommonKeyDescriptions(): string[] {
  return [
    t('rentalAgreementKeyCard.commonDescriptions.frontDoor'),
    t('rentalAgreementKeyCard.commonDescriptions.apartmentDoor'),
    t('rentalAgreementKeyCard.commonDescriptions.mailbox'),
    t('rentalAgreementKeyCard.commonDescriptions.basement'),
    t('rentalAgreementKeyCard.commonDescriptions.garage'),
    t('rentalAgreementKeyCard.commonDescriptions.attic'),
    t('rentalAgreementKeyCard.commonDescriptions.mainEntrance'),
  ];
}

function searchDescriptions(event: { query: string }) {
  const query = event.query.toLowerCase();
  const all = getCommonKeyDescriptions();
  filteredDescriptions.value = query ? all.filter((d) => d.toLowerCase().includes(query)) : all;
}

const issuedAtRequiredError = computed(() => {
  if (issuedAtValue.value) return null;
  if (issuedAtTouched.value || submitAttempted.value) return t('validation.required');
  return null;
});

const schema = z.object({
  amountOfKeys: z
    .number({ message: t('newKeyDialog.amountRequired') })
    .int()
    .min(1, { message: t('newKeyDialog.amountRequired') }),
  keyDescription: z
    .string()
    .trim()
    .min(1, { message: t('validation.required') })
    .max(100, { message: t('validation.maxLength', { max: 100 }) }),
});
const resolver = zodResolver(schema);

const initialValues = ref({
  amountOfKeys: null as number | null,
  keyDescription: '',
});

function openDialog() {
  visible.value = true;
}

function resetForm() {
  initialValues.value = { amountOfKeys: null, keyDescription: '' };
  issuedAtValue.value = null;
  issuedAtTouched.value = false;
  submitAttempted.value = false;
  formKey.value += 1;
}

function onSubmit(event: FormSubmitEvent) {
  submitAttempted.value = true;
  if (!event.valid || !issuedAtValue.value) return;

  const formState = event.states;
  emit('newKey', {
    amountOfKeys: formState.amountOfKeys?.value,
    keyDescription: formState.keyDescription?.value?.trim(),
    issuedAt: toISODateString(issuedAtValue.value),
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
    :label="t('newKeyDialog.dialogTitle')"
    icon="pi pi-plus"
    :disabled="props.disabled"
    @click="openDialog"
  />

  <BaseDialog v-model:visible="visible" :closable="false" :header="t('newKeyDialog.dialogTitle')">
    <Form
      :key="formKey" v-slot="$form"
      :initialValues :resolver
      @submit="onSubmit"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="amountOfKeys" class="font-semibold">
            {{ t('newKeyDialog.amountLabel') }} *
          </label>
          <InputNumber
            inputId="amountOfKeys"
            name="amountOfKeys"
            :min="1"
            showButtons
            fluid
            :class="{ 'p-invalid': $form.amountOfKeys?.invalid && $form.amountOfKeys?.touched }"
            autofocus
          />
          <Message
            v-if="$form.amountOfKeys?.invalid && $form.amountOfKeys?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.amountOfKeys.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <label for="keyDescription" class="font-semibold">
            {{ t('newKeyDialog.descriptionLabel') }} *
          </label>
          <AutoComplete
            inputId="keyDescription"
            name="keyDescription"
            :suggestions="filteredDescriptions"
            :placeholder="t('newKeyDialog.descriptionPlaceholder')"
            :class="{ 'p-invalid': $form.keyDescription?.invalid && $form.keyDescription?.touched }"
            fluid
            @complete="searchDescriptions"
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
          <label for="issuedAt" class="font-semibold">
            {{ t('newKeyDialog.issuedAtLabel') }} *
          </label>
          <DatePicker
            v-model="issuedAtValue"
            inputId="issuedAt"
            dateFormat="dd.mm.yy"
            showIcon
            :invalid="!!issuedAtRequiredError"
            fluid
            @blur="issuedAtTouched = true"
          />
          <Message v-if="issuedAtRequiredError" severity="error" size="small" variant="simple">
            {{ issuedAtRequiredError }}
          </Message>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <Button type="button" :label="t('button.cancel')" severity="secondary" @click="onCancel" />
        <Button
          type="submit"
          :label="t('newKeyDialog.dialogTitle')"
          icon="pi pi-plus"
          :disabled="!issuedAtValue || !$form.amountOfKeys?.value || !$form.keyDescription?.value"
        />
      </div>
    </Form>
  </BaseDialog>
</template>
