<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

// Types
import type { TenantJson } from '@/services/RentalAgreementService';

// Props & Emits
defineProps<{
  initialTenant?: TenantJson | null;
}>();

const emit = defineEmits<{
  submit: [tenant: TenantJson];
  cancel: [];
}>();

const { t } = useI18n();

// State
const dateOfBirthValue = ref<Date | null>(null);

// Zod Schema
const schema = z.object({
  firstName: z.string().trim().min(1, { message: t('validation.required') }),
  lastName: z.string().trim().min(1, { message: t('validation.required') }),
  email: z.email({ message: t('validation.email') }).or(z.literal('')),
  mobilePhoneNumber: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{4,14}$/, { message: t('validation.phone') })
    .or(z.literal('')),
  businessPhoneNumber: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{4,14}$/, { message: t('validation.phone') })
    .or(z.literal('')),
  privatePhoneNumber: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{4,14}$/, { message: t('validation.phone') })
    .or(z.literal('')),
  placeOfBirth: z.string().trim().or(z.literal('')),
});

const resolver = zodResolver(schema);
const initialValues = ref({
  firstName: '',
  lastName: '',
  email: '',
  mobilePhoneNumber: '',
  businessPhoneNumber: '',
  privatePhoneNumber: '',
  placeOfBirth: '',
});

// Convert Date to ISO string (YYYY-MM-DD format for LocalDate)
function toISODateString(date: Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
}

// Form submission
function onSubmit(event: FormSubmitEvent) {
  const formState = event.states;
  if (!event.valid) return;

  emit('submit', {
    firstName: formState.firstName?.value.trim(),
    lastName: formState.lastName?.value.trim(),
    email: formState.email?.value?.trim() || undefined,
    mobilePhoneNumber: formState.mobilePhoneNumber?.value?.trim() || undefined,
    businessPhoneNumber: formState.businessPhoneNumber?.value?.trim() || undefined,
    privatePhoneNumber: formState.privatePhoneNumber?.value?.trim() || undefined,
    placeOfBirth: formState.placeOfBirth?.value?.trim() || undefined,
    dateOfBirth: toISODateString(dateOfBirthValue.value) || undefined,
  });

  // Reset form
  initialValues.value = {
    firstName: '',
    lastName: '',
    email: '',
    mobilePhoneNumber: '',
    businessPhoneNumber: '',
    privatePhoneNumber: '',
    placeOfBirth: '',
  };
  dateOfBirthValue.value = null;
}
</script>

<template>
  <div class="p-4 border rounded-lg bg-blue-50">
    <h4 class="font-semibold mb-4">
      {{ t('rentalAgreement.step3.newTenantDetails') }}
    </h4>

    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- First Name -->
        <div class="flex flex-col gap-2">
          <label for="firstName" class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.firstName') }} *
          </label>
          <InputText
            name="firstName"
            type="text"
            :placeholder="t('rentalAgreement.step3.firstName')"
            :class="{ 'p-invalid': $form.firstName?.invalid && $form.firstName?.touched }"
            fluid
            autofocus
          />
          <Message
            v-if="$form.firstName?.invalid && $form.firstName?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.firstName.error.message }}
          </Message>
        </div>

        <!-- Last Name -->
        <div class="flex flex-col gap-2">
          <label for="lastName" class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.lastName') }} *
          </label>
          <InputText
            name="lastName"
            type="text"
            :placeholder="t('rentalAgreement.step3.lastName')"
            :class="{ 'p-invalid': $form.lastName?.invalid && $form.lastName?.touched }"
            fluid
          />
          <Message
            v-if="$form.lastName?.invalid && $form.lastName?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.lastName.error.message }}
          </Message>
        </div>

        <!-- Email -->
        <div class="flex flex-col gap-2">
          <label for="email" class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.email') }}
          </label>
          <InputText
            name="email"
            type="email"
            :placeholder="t('rentalAgreement.step3.email')"
            :class="{ 'p-invalid': $form.email?.invalid && $form.email?.touched }"
            fluid
          />
          <Message
            v-if="$form.email?.invalid && $form.email?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.email.error.message }}
          </Message>
        </div>

        <!-- Mobile Phone -->
        <div class="flex flex-col gap-2">
          <label for="mobilePhoneNumber" class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.mobilePhone') }}
          </label>
          <InputText
            name="mobilePhoneNumber"
            type="tel"
            placeholder="+491234567890"
            :class="{
              'p-invalid': $form.mobilePhoneNumber?.invalid && $form.mobilePhoneNumber?.touched,
            }"
            fluid
          />
          <Message
            v-if="$form.mobilePhoneNumber?.invalid && $form.mobilePhoneNumber?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.mobilePhoneNumber.error.message }}
          </Message>
        </div>

        <!-- Business Phone -->
        <div class="flex flex-col gap-2">
          <label for="businessPhoneNumber" class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.businessPhone') }}
          </label>
          <InputText
            name="businessPhoneNumber"
            type="tel"
            placeholder="+491234567890"
            :class="{
              'p-invalid':
                $form.businessPhoneNumber?.invalid && $form.businessPhoneNumber?.touched,
            }"
            fluid
          />
          <Message
            v-if="$form.businessPhoneNumber?.invalid && $form.businessPhoneNumber?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.businessPhoneNumber.error.message }}
          </Message>
        </div>

        <!-- Private Phone -->
        <div class="flex flex-col gap-2">
          <label for="privatePhoneNumber" class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.privatePhone') }}
          </label>
          <InputText
            name="privatePhoneNumber"
            type="tel"
            placeholder="+491234567890"
            :class="{
              'p-invalid': $form.privatePhoneNumber?.invalid && $form.privatePhoneNumber?.touched,
            }"
            fluid
          />
          <Message
            v-if="$form.privatePhoneNumber?.invalid && $form.privatePhoneNumber?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.privatePhoneNumber.error.message }}
          </Message>
        </div>

        <!-- Place of Birth -->
        <div class="flex flex-col gap-2">
          <label for="placeOfBirth" class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.placeOfBirth') }}
          </label>
          <InputText
            name="placeOfBirth"
            type="text"
            :placeholder="t('rentalAgreement.step3.placeOfBirth')"
            :class="{ 'p-invalid': $form.placeOfBirth?.invalid && $form.placeOfBirth?.touched }"
            fluid
          />
          <Message
            v-if="$form.placeOfBirth?.invalid && $form.placeOfBirth?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.placeOfBirth.error.message }}
          </Message>
        </div>

        <!-- Date of Birth -->
        <div class="flex flex-col gap-2">
          <label for="dateOfBirth" class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.dateOfBirth') }}
          </label>
          <DatePicker v-model="dateOfBirthValue" dateFormat="dd.mm.yy" showIcon fluid />
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
          :label="t('rentalAgreement.step3.addTenantToList')"
          icon="pi pi-check"
          :disabled="
            !$form.firstName?.valid ||
              !$form.firstName?.dirty ||
              !$form.lastName?.valid ||
              !$form.lastName?.dirty
          "
        />
      </div>
    </Form>
  </div>
</template>
