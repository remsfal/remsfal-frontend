<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { toISODateString } from '@/helper/dataHelper';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

// Components
import PhoneInput from '@/components/common/PhoneInput.vue';

// Types
import type { TenantJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';

// Props & Emits
const props = withDefaults(
  defineProps<{
    initialValues?: Partial<TenantJson> | null;
    mode?: 'create' | 'edit';
    submitLabel: string;
    showCancel?: boolean;
    heading?: string;
  }>(),
  {
    initialValues: null,
    mode: 'create',
    showCancel: true,
    heading: undefined,
  },
);

const emit = defineEmits<{
  submit: [tenant: TenantJson];
  cancel: [];
}>();

const { t } = useI18n();

const phoneRegex = /^\+[1-9]\d{4,14}$/;

// Zod Schema (name/email/place of birth only; phone numbers are handled outside the
// PrimeVue Form via PhoneInput, which does not integrate with the Form's `name` binding)
const schema = z.object({
  firstName: z.string().trim().min(1, { message: t('validation.required') }),
  lastName: z.string().trim().min(1, { message: t('validation.required') }),
  email: z
    .string()
    .trim()
    .email({ message: t('validation.email') })
    .optional()
    .or(z.literal('')),
  placeOfBirth: z.string().trim().optional().or(z.literal('')),
});

const resolver = zodResolver(schema);

const initialValues = computed(() => ({
  firstName: props.initialValues?.firstName ?? '',
  lastName: props.initialValues?.lastName ?? '',
  email: props.initialValues?.email ?? '',
  placeOfBirth: props.initialValues?.placeOfBirth ?? '',
}));

const serverDateOfBirth = props.initialValues?.dateOfBirth
  ? new Date(props.initialValues.dateOfBirth)
  : null;
const dateOfBirthValue = ref<Date | null>(serverDateOfBirth);
const dateOfBirthDirty = computed(
  () => toISODateString(dateOfBirthValue.value) !== toISODateString(serverDateOfBirth),
);

const serverPhones = {
  mobile: props.initialValues?.mobilePhoneNumber ?? '',
  business: props.initialValues?.businessPhoneNumber ?? '',
  private: props.initialValues?.privatePhoneNumber ?? '',
};
const currentPhones = reactive({ ...serverPhones });

const phoneDirty = computed(
  () =>
    currentPhones.mobile !== serverPhones.mobile ||
    currentPhones.business !== serverPhones.business ||
    currentPhones.private !== serverPhones.private,
);

function phoneFieldError(val: string) {
  return val && !phoneRegex.test(val) ? t('validation.phone') : null;
}
const mobilePhoneError = computed(() => phoneFieldError(currentPhones.mobile));
const businessPhoneError = computed(() => phoneFieldError(currentPhones.business));
const privatePhoneError = computed(() => phoneFieldError(currentPhones.private));
const hasPhoneError = computed(
  () => !!mobilePhoneError.value || !!businessPhoneError.value || !!privatePhoneError.value,
);

function isSubmitDisabled($form: Record<string, { valid?: boolean; dirty?: boolean } | undefined>) {
  if (hasPhoneError.value) return true;

  if (props.mode !== 'edit') {
    // Create mode: require the mandatory fields to be both valid and dirty,
    // so the button isn't enabled before any interaction.
    return (
      !$form.firstName?.valid ||
      !$form.firstName?.dirty ||
      !$form.lastName?.valid ||
      !$form.lastName?.dirty
    );
  }

  const requiredValid = !!$form.firstName?.valid && !!$form.lastName?.valid;
  if (!requiredValid) return true;

  const fieldDirty = ['firstName', 'lastName', 'email', 'placeOfBirth'].some(
    key => $form[key]?.dirty,
  );
  return !(fieldDirty || phoneDirty.value || dateOfBirthDirty.value);
}

// Form submission
function onSubmit(event: FormSubmitEvent) {
  const formState = event.states;
  if (!event.valid || hasPhoneError.value) return;

  emit('submit', {
    id: props.initialValues?.id,
    firstName: formState.firstName?.value?.trim() || '',
    lastName: formState.lastName?.value?.trim() || '',
    email: formState.email?.value?.trim() || undefined,
    placeOfBirth: formState.placeOfBirth?.value?.trim() || undefined,
    dateOfBirth: toISODateString(dateOfBirthValue.value) || undefined,
    mobilePhoneNumber: currentPhones.mobile || undefined,
    businessPhoneNumber: currentPhones.business || undefined,
    privatePhoneNumber: currentPhones.private || undefined,
  });
}
</script>

<template>
  <div :class="mode === 'create' ? 'p-4 border rounded-lg bg-gray-50' : undefined">
    <h4 v-if="heading" class="font-semibold mb-4">
      {{ heading }}
    </h4>

    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- First Name -->
          <div class="flex flex-col gap-1">
            <label for="firstName" class="font-medium">
              {{ t('tenantForm.firstName') }} *
            </label>
            <InputText
              id="firstName"
              name="firstName"
              type="text"
              :placeholder="t('tenantForm.firstName')"
              :class="{ 'p-invalid': $form.firstName?.invalid }"
              fluid
              autofocus
            />
            <Message
              v-if="$form.firstName?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.firstName.error?.message }}
            </Message>
          </div>

          <!-- Last Name -->
          <div class="flex flex-col gap-1">
            <label for="lastName" class="font-medium">
              {{ t('tenantForm.lastName') }} *
            </label>
            <InputText
              id="lastName"
              name="lastName"
              type="text"
              :placeholder="t('tenantForm.lastName')"
              :class="{ 'p-invalid': $form.lastName?.invalid }"
              fluid
            />
            <Message
              v-if="$form.lastName?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.lastName.error?.message }}
            </Message>
          </div>

          <!-- Email -->
          <div class="flex flex-col gap-1">
            <label for="email" class="font-medium">
              {{ t('tenantForm.email') }}
            </label>
            <InputText
              id="email"
              name="email"
              type="email"
              :placeholder="t('tenantForm.email')"
              :class="{ 'p-invalid': $form.email?.invalid }"
              fluid
            />
            <Message
              v-if="$form.email?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.email.error?.message }}
            </Message>
          </div>

          <!-- Mobile Phone -->
          <div class="flex flex-col gap-1">
            <label for="mobile-phone" class="font-medium">
              {{ t('tenantForm.mobilePhone') }}
            </label>
            <PhoneInput
              inputId="mobile-phone"
              :modelValue="currentPhones.mobile"
              @update:modelValue="(v) => (currentPhones.mobile = v)"
            />
            <Message
              v-if="mobilePhoneError && currentPhones.mobile"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ mobilePhoneError }}
            </Message>
          </div>

          <!-- Business Phone -->
          <div class="flex flex-col gap-1">
            <label for="business-phone" class="font-medium">
              {{ t('tenantForm.businessPhone') }}
            </label>
            <PhoneInput
              inputId="business-phone"
              :modelValue="currentPhones.business"
              @update:modelValue="(v) => (currentPhones.business = v)"
            />
            <Message
              v-if="businessPhoneError && currentPhones.business"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ businessPhoneError }}
            </Message>
          </div>

          <!-- Private Phone -->
          <div class="flex flex-col gap-1">
            <label for="private-phone" class="font-medium">
              {{ t('tenantForm.privatePhone') }}
            </label>
            <PhoneInput
              inputId="private-phone"
              :modelValue="currentPhones.private"
              @update:modelValue="(v) => (currentPhones.private = v)"
            />
            <Message
              v-if="privatePhoneError && currentPhones.private"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ privatePhoneError }}
            </Message>
          </div>

          <!-- Place of Birth -->
          <div class="flex flex-col gap-1">
            <label for="placeOfBirth" class="font-medium">
              {{ t('tenantForm.placeOfBirth') }}
            </label>
            <InputText
              id="placeOfBirth"
              name="placeOfBirth"
              type="text"
              :placeholder="t('tenantForm.placeOfBirth')"
              fluid
            />
          </div>

          <!-- Date of Birth -->
          <div class="flex flex-col gap-1">
            <label for="dateOfBirth" class="font-medium">
              {{ t('tenantForm.dateOfBirth') }}
            </label>
            <DatePicker
              v-model="dateOfBirthValue"
              inputId="dateOfBirth"
              dateFormat="dd.mm.yy"
              showIcon
              fluid
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3">
          <Button
            v-if="showCancel"
            type="button"
            :label="t('button.cancel')"
            severity="secondary"
            @click="emit('cancel')"
          />
          <Button
            type="submit"
            :label="submitLabel"
            :icon="mode === 'edit' ? 'pi pi-save' : 'pi pi-check'"
            :disabled="isSubmitDisabled($form)"
          />
        </div>
      </div>
    </Form>
  </div>
</template>
