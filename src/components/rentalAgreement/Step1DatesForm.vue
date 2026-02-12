<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';

// PrimeVue Forms
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

// Props & Emits
const props = defineProps<{
  startOfRental: string | null;
  endOfRental: string | null;
}>();

const emit = defineEmits<{
  'update:startOfRental': [value: string | null];
  'update:endOfRental': [value: string | null];
  next: [];
}>();

const { t } = useI18n();

// Zod Validation Schema - DatePicker returns Date objects
const step1Schema = z
  .object({
    startOfRental: z
      .union([z.string(), z.date()])
      .refine(
        (val) => val !== null && val !== undefined && val !== '',
        { message: t('rentalAgreement.validation.startRequired') },
      ),
    endOfRental: z.union([z.string(), z.date(), z.null()]).optional(),
  })
  .refine(
    (data) => {
      if (data.endOfRental) {
        const endDate = data.endOfRental instanceof Date ? data.endOfRental : new Date(data.endOfRental);
        const startDate = data.startOfRental instanceof Date ? data.startOfRental : new Date(data.startOfRental as string);
        return endDate > startDate;
      }
      return true;
    },
    {
      message: t('rentalAgreement.validation.endAfterStart'),
      path: ['endOfRental'],
    },
  );

const resolver = zodResolver(step1Schema);

// Initial Values - Convert strings to Date objects if present
const initialValues = ref({
  startOfRental: props.startOfRental ? new Date(props.startOfRental) : (null as Date | null),
  endOfRental: props.endOfRental ? new Date(props.endOfRental) : (null as Date | null),
});

// Convert Date to ISO string (YYYY-MM-DD format for LocalDate)
function toISODateString(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0] as string;
}

// Form Submit Handler
const onSubmit = (event: FormSubmitEvent) => {
  const formState = event.states;

  const startDate = formState.startOfRental?.value;
  const endDate = formState.endOfRental?.value;

  if (!event.valid || !startDate) {
    return;
  }

  // Convert Date objects to ISO strings for API
  const startDateString = toISODateString(startDate);
  const endDateString = toISODateString(endDate);

  // Update parent state
  emit('update:startOfRental', startDateString);
  emit('update:endOfRental', endDateString);
  emit('next');
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <h3 class="text-xl font-semibold">
      {{ t('rentalAgreement.step1.title') }}
    </h3>

    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-6">
        <!-- Start Date Field -->
        <div class="flex flex-col gap-2">
          <label for="startOfRental" class="font-semibold">
            {{ t('rentalAgreement.step1.startDate') }} *
          </label>
          <DatePicker
            id="startOfRental"
            name="startOfRental"
            dateFormat="dd.mm.yy"
            :placeholder="t('rentalAgreement.step1.startPlaceholder')"
            :class="{ 'p-invalid': $form.startOfRental?.invalid && $form.startOfRental?.touched }"
            showIcon
            fluid
            autofocus
          />
          <Message
            v-if="$form.startOfRental?.invalid && $form.startOfRental?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.startOfRental.error.message }}
          </Message>
        </div>

        <!-- End Date Field -->
        <div class="flex flex-col gap-2">
          <label for="endOfRental" class="font-semibold">
            {{ t('rentalAgreement.step1.endDate') }}
          </label>
          <DatePicker
            id="endOfRental"
            name="endOfRental"
            dateFormat="dd.mm.yy"
            :placeholder="t('rentalAgreement.step1.endPlaceholder')"
            :class="{ 'p-invalid': $form.endOfRental?.invalid && $form.endOfRental?.touched }"
            showIcon
            fluid
          />
          <Message
            v-if="$form.endOfRental?.invalid && $form.endOfRental?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.endOfRental.error.message }}
          </Message>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 mt-6">
        <Button
          type="submit"
          :label="t('rentalAgreement.step1.nextButton')"
          icon="pi pi-arrow-right"
          iconPos="right"
          :disabled="!$form.startOfRental?.valid"
        />
      </div>
    </Form>
  </div>
</template>
