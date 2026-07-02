<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import SelectButton from 'primevue/selectbutton';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

// Types
export interface RentalDetails {
  basicRent?: number;
  operatingCostsPrepayment?: number;
  heatingCostsPrepayment?: number;
  billingCycle: 'MONTHLY' | 'WEEKLY';
  firstPaymentDate?: string;
  lastPaymentDate?: string;
}

// Props & Emits
const props = defineProps<{
  unitTitle: string;
  unitType: string;
  initialFirstPaymentDate?: string;
  initialLastPaymentDate?: string;
}>();

const emit = defineEmits<{
  submit: [details: RentalDetails];
  cancel: [];
}>();

const { t } = useI18n();

// Billing Cycle Options
const billingCycleOptions = [
  { label: t('billingCycle.monthly'), value: 'MONTHLY' },
  { label: t('billingCycle.weekly'), value: 'WEEKLY' },
];

// State
const firstPaymentDateValue = ref<Date | null>(
  props.initialFirstPaymentDate ? new Date(props.initialFirstPaymentDate) : null,
);
const lastPaymentDateValue = ref<Date | null>(
  props.initialLastPaymentDate ? new Date(props.initialLastPaymentDate) : null,
);

// Zod Schema
const schema = z
  .object({
    basicRent: z.number().min(0, {message: t('validation.minValue', { min: 0 }),}).optional().or(z.literal(null)),
    operatingCostsPrepayment: z.number().min(0).optional().or(z.literal(null)),
    heatingCostsPrepayment: z.number().min(0).optional().or(z.literal(null)),
    billingCycle: z.enum(['MONTHLY', 'WEEKLY']),
  })
  .refine(
    () => {
      if (!firstPaymentDateValue.value || !lastPaymentDateValue.value) return true;
      return lastPaymentDateValue.value > firstPaymentDateValue.value;
    },
    {
      message: t('rentalAgreement.validation.endAfterStart'),
      path: ['lastPaymentDate'],
    },
  );

const resolver = zodResolver(schema);
const initialValues = ref({
  basicRent: null as number | null,
  operatingCostsPrepayment: null as number | null,
  heatingCostsPrepayment: null as number | null,
  billingCycle: 'MONTHLY' as 'MONTHLY' | 'WEEKLY',
});

// Convert Date to ISO string (YYYY-MM-DD format for LocalDate)
function toISODateString(date: Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
}

// Custom validation for dates
const dateValidationError = computed(() => {
  if (!firstPaymentDateValue.value || !lastPaymentDateValue.value) return null;
  if (lastPaymentDateValue.value <= firstPaymentDateValue.value) {
    return t('rentalAgreement.validation.endAfterStart');
  }
  return null;
});

// Form submission
function onSubmit(event: FormSubmitEvent) {
  const formState = event.states;
  if (!event.valid || dateValidationError.value) return;

  emit('submit', {
    basicRent: formState.basicRent?.value || undefined,
    operatingCostsPrepayment: formState.operatingCostsPrepayment?.value || undefined,
    heatingCostsPrepayment: formState.heatingCostsPrepayment?.value || undefined,
    billingCycle: formState.billingCycle?.value,
    firstPaymentDate: toISODateString(firstPaymentDateValue.value) || undefined,
    lastPaymentDate: toISODateString(lastPaymentDateValue.value) || undefined,
  });

  // Reset form
  initialValues.value = {
    basicRent: null,
    operatingCostsPrepayment: null,
    heatingCostsPrepayment: null,
    billingCycle: 'MONTHLY',
  };
  firstPaymentDateValue.value = null;
  lastPaymentDateValue.value = null;
}
</script>

<template>
  <div class="p-4 border rounded-lg bg-blue-50">
    <h4 class="font-semibold mb-2">
      {{ unitTitle }}
    </h4>
    <p class="text-sm text-gray-600 mb-4">
      {{ t(`unitTypes.${unitType.toLowerCase()}`) }}
    </p>

    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Basic Rent -->
        <div class="flex flex-col gap-2">
          <label for="basicRent" class="text-sm font-semibold">
            {{ t('rentalAgreement.step2.basicRent') }}
          </label>
          <InputNumber
            name="basicRent"
            :min="0"
            :maxFractionDigits="2"
            mode="currency"
            currency="EUR"
            locale="de-DE"
            :class="{ 'p-invalid': $form.basicRent?.invalid && $form.basicRent?.touched }"
            fluid
            autofocus
          />
          <Message
            v-if="$form.basicRent?.invalid && $form.basicRent?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.basicRent.error.message }}
          </Message>
        </div>

        <!-- Billing Cycle -->
        <div class="flex flex-col gap-2">
          <label for="billingCycle" class="text-sm font-semibold">
            {{ t('rentalAgreement.step2.billingCycle') }} *
          </label>
          <SelectButton
            name="billingCycle"
            :options="billingCycleOptions"
            optionLabel="label"
            optionValue="value"
            fluid
            class="w-full"
          />
        </div>

        <!-- Operating Costs -->
        <div class="flex flex-col gap-2">
          <label for="operatingCostsPrepayment" class="text-sm font-semibold">
            {{ t('rentalAgreement.step2.operatingCosts') }}
          </label>
          <InputNumber
            name="operatingCostsPrepayment"
            :min="0"
            :maxFractionDigits="2"
            mode="currency"
            currency="EUR"
            locale="de-DE"
            :class="{
              'p-invalid':
                $form.operatingCostsPrepayment?.invalid && $form.operatingCostsPrepayment?.touched,
            }"
            fluid
          />
          <Message
            v-if="$form.operatingCostsPrepayment?.invalid && $form.operatingCostsPrepayment?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.operatingCostsPrepayment.error.message }}
          </Message>
        </div>

        <!-- Heating Costs -->
        <div class="flex flex-col gap-2">
          <label for="heatingCostsPrepayment" class="text-sm font-semibold">
            {{ t('rentalAgreement.step2.heatingCosts') }}
          </label>
          <InputNumber
            name="heatingCostsPrepayment"
            :min="0"
            :maxFractionDigits="2"
            mode="currency"
            currency="EUR"
            locale="de-DE"
            :class="{
              'p-invalid':
                $form.heatingCostsPrepayment?.invalid && $form.heatingCostsPrepayment?.touched,
            }"
            fluid
          />
          <Message
            v-if="$form.heatingCostsPrepayment?.invalid && $form.heatingCostsPrepayment?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.heatingCostsPrepayment.error.message }}
          </Message>
        </div>

        <!-- First Payment Date -->
        <div class="flex flex-col gap-2">
          <label for="firstPaymentDate" class="text-sm font-semibold">
            {{ t('rentalAgreement.step2.firstPayment') }}
          </label>
          <DatePicker v-model="firstPaymentDateValue" dateFormat="dd.mm.yy" showIcon fluid />
        </div>

        <!-- Last Payment Date -->
        <div class="flex flex-col gap-2">
          <label for="lastPaymentDate" class="text-sm font-semibold">
            {{ t('rentalAgreement.step2.lastPayment') }}
          </label>
          <DatePicker v-model="lastPaymentDateValue" dateFormat="dd.mm.yy" showIcon fluid />
          <Message v-if="dateValidationError" severity="error" size="small" variant="simple">
            {{ dateValidationError }}
          </Message>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          :label="t('button.cancel')"
          severity="secondary"
          @click="emit('cancel')"
        />
        <Button
          type="submit"
          :label="t('rentalAgreement.step2.addUnit')"
          icon="pi pi-plus"
          :disabled="!!dateValidationError"
        />
      </div>
    </Form>
  </div>
</template>
