<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import BaseCard from '@/components/common/BaseCard.vue';

// Use TenantItem from API schema instead of custom interface
import type { TenantItem } from '@/services/RentalAgreementService';

// Re-export for parent components
export type { TenantItem as TenantItem };

// Props & Emits
const props = defineProps<{
  tenants: TenantItem[];
}>();

const emit = defineEmits<{
  'update:tenants': [value: TenantItem[]];
  back: [];
  next: [];
}>();

const { t } = useI18n();

// Add Tenant
function addTenant() {
  const newTenant: TenantItem = {
    firstName: '',
    lastName: '',
  };
  emit('update:tenants', [...props.tenants, newTenant]);
}

// Remove Tenant
function removeTenant(index: number) {
  if (props.tenants.length <= 1) return; // Keep at least one
  const updated = props.tenants.filter((_, i) => i !== index);
  emit('update:tenants', updated);
}

// Convert Date to ISO string (YYYY-MM-DD format for LocalDate)
function toISODateString(date: Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
}

// Convert ISO string to Date for DatePicker display
function toDateObject(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  return new Date(dateString);
}

// Update Tenant Field
function updateTenantField(index: number, field: keyof TenantItem, value: any) {
  const updated = [...props.tenants];
  const tenant = updated[index];

  // Convert Date objects to ISO strings for date fields
  if (field === 'dateOfBirth') {
    updated[index] = { ...tenant, [field]: toISODateString(value) } as TenantItem;
  } else if (field === 'firstName' || field === 'lastName') {
    // firstName and lastName are required, ensure they're never undefined
    updated[index] = { ...tenant, [field]: (value || '') as string } as TenantItem;
  } else {
    updated[index] = { ...tenant, [field]: value || undefined } as TenantItem;
  }

  emit('update:tenants', updated);
}

// Validation: All tenants must have firstName and lastName
const isValid = computed(() => {
  return (
    props.tenants.length > 0 &&
    props.tenants.every((t) => t.firstName?.trim() !== '' && t.lastName?.trim() !== '')
  );
});

// Phone validation helper
const phonePattern = /^\+[1-9]\d{4,14}$/;

function validatePhone(phone: string | undefined): boolean {
  if (!phone || phone.trim() === '') return true; // Optional field
  return phonePattern.test(phone);
}

// Email validation helper
function validateEmail(email: string | undefined): boolean {
  if (!email || email.trim() === '') return true; // Optional field
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Individual tenant validation
function getTenantErrors(tenant: TenantItem): string[] {
  const errors: string[] = [];
  if (!tenant.firstName.trim()) errors.push(t('rentalAgreement.validation.firstNameRequired'));
  if (!tenant.lastName.trim()) errors.push(t('rentalAgreement.validation.lastNameRequired'));
  if (tenant.email && !validateEmail(tenant.email))
    errors.push(t('rentalAgreement.validation.emailInvalid'));
  if (tenant.mobilePhoneNumber && !validatePhone(tenant.mobilePhoneNumber))
    errors.push(t('rentalAgreement.validation.phoneInvalid'));
  if (tenant.businessPhoneNumber && !validatePhone(tenant.businessPhoneNumber))
    errors.push(t('rentalAgreement.validation.phoneInvalid'));
  if (tenant.privatePhoneNumber && !validatePhone(tenant.privatePhoneNumber))
    errors.push(t('rentalAgreement.validation.phoneInvalid'));
  return errors;
}

// Go to Next Step
function goNext() {
  if (!isValid.value) return;
  emit('next');
}

// Initialize with one tenant if empty
if (props.tenants.length === 0) {
  addTenant();
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h3 class="text-xl font-semibold">
      {{ t('rentalAgreement.step3.title') }}
    </h3>

    <!-- Validation Message -->
    <Message
      v-if="tenants.length === 0"
      severity="info"
      size="small"
      variant="simple"
    >
      {{ t('rentalAgreement.validation.oneTenantRequired') }}
    </Message>

    <!-- Tenants List -->
    <div class="flex flex-col gap-4">
      <BaseCard
        v-for="(tenant, index) in tenants"
        :key="index"
      >
        <template #title>
          <div class="flex justify-between items-center">
            <span>{{ t('rentalAgreement.step3.title') }} {{ index + 1 }}</span>
            <Button
              v-if="tenants.length > 1"
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              :aria-label="t('rentalAgreement.step3.removeTenant')"
              @click="removeTenant(index)"
            />
          </div>
        </template>

        <template #content>
          <!-- Tenant Error Messages -->
          <div v-if="getTenantErrors(tenant).length > 0" class="mb-4">
            <Message
              v-for="(error, errorIndex) in getTenantErrors(tenant)"
              :key="errorIndex"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ error }}
            </Message>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- First Name -->
            <div class="flex flex-col gap-2">
              <label :for="`firstName-${index}`" class="font-semibold">
                {{ t('rentalAgreement.step3.firstName') }} *
              </label>
              <InputText
                :id="`firstName-${index}`"
                :modelValue="tenant.firstName"
                type="text"
                :class="{ 'p-invalid': !tenant.firstName.trim() }"
                fluid
                @update:modelValue="updateTenantField(index, 'firstName', $event)"
              />
            </div>

            <!-- Last Name -->
            <div class="flex flex-col gap-2">
              <label :for="`lastName-${index}`" class="font-semibold">
                {{ t('rentalAgreement.step3.lastName') }} *
              </label>
              <InputText
                :id="`lastName-${index}`"
                :modelValue="tenant.lastName"
                type="text"
                :class="{ 'p-invalid': !tenant.lastName.trim() }"
                fluid
                @update:modelValue="updateTenantField(index, 'lastName', $event)"
              />
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-2">
              <label :for="`email-${index}`" class="font-semibold">
                {{ t('rentalAgreement.step3.email') }}
              </label>
              <InputText
                :id="`email-${index}`"
                :modelValue="tenant.email"
                type="email"
                :class="{ 'p-invalid': tenant.email && !validateEmail(tenant.email) }"
                fluid
                @update:modelValue="updateTenantField(index, 'email', $event)"
              />
            </div>

            <!-- Mobile Phone -->
            <div class="flex flex-col gap-2">
              <label :for="`mobile-${index}`" class="font-semibold">
                {{ t('rentalAgreement.step3.mobilePhone') }}
              </label>
              <InputText
                :id="`mobile-${index}`"
                :modelValue="tenant.mobilePhoneNumber"
                type="tel"
                placeholder="+491234567890"
                :class="{ 'p-invalid': tenant.mobilePhoneNumber && !validatePhone(tenant.mobilePhoneNumber) }"
                fluid
                @update:modelValue="updateTenantField(index, 'mobilePhoneNumber', $event)"
              />
            </div>

            <!-- Business Phone -->
            <div class="flex flex-col gap-2">
              <label :for="`business-${index}`" class="font-semibold">
                {{ t('rentalAgreement.step3.businessPhone') }}
              </label>
              <InputText
                :id="`business-${index}`"
                :modelValue="tenant.businessPhoneNumber"
                type="tel"
                placeholder="+491234567890"
                :class="{ 'p-invalid': tenant.businessPhoneNumber && !validatePhone(tenant.businessPhoneNumber) }"
                fluid
                @update:modelValue="updateTenantField(index, 'businessPhoneNumber', $event)"
              />
            </div>

            <!-- Private Phone -->
            <div class="flex flex-col gap-2">
              <label :for="`private-${index}`" class="font-semibold">
                {{ t('rentalAgreement.step3.privatePhone') }}
              </label>
              <InputText
                :id="`private-${index}`"
                :modelValue="tenant.privatePhoneNumber"
                type="tel"
                placeholder="+491234567890"
                :class="{ 'p-invalid': tenant.privatePhoneNumber && !validatePhone(tenant.privatePhoneNumber) }"
                fluid
                @update:modelValue="updateTenantField(index, 'privatePhoneNumber', $event)"
              />
            </div>

            <!-- Place of Birth -->
            <div class="flex flex-col gap-2">
              <label :for="`placeOfBirth-${index}`" class="font-semibold">
                {{ t('rentalAgreement.step3.placeOfBirth') }}
              </label>
              <InputText
                :id="`placeOfBirth-${index}`"
                :modelValue="tenant.placeOfBirth"
                type="text"
                fluid
                @update:modelValue="updateTenantField(index, 'placeOfBirth', $event)"
              />
            </div>

            <!-- Date of Birth -->
            <div class="flex flex-col gap-2">
              <label :for="`dateOfBirth-${index}`" class="font-semibold">
                {{ t('rentalAgreement.step3.dateOfBirth') }}
              </label>
              <DatePicker
                :id="`dateOfBirth-${index}`"
                :modelValue="toDateObject(tenant.dateOfBirth)"
                dateFormat="dd.mm.yy"
                showIcon
                fluid
                @update:modelValue="updateTenantField(index, 'dateOfBirth', $event)"
              />
            </div>
          </div>
        </template>
      </BaseCard>
    </div>

    <!-- Add Tenant Button -->
    <Button
      :label="t('rentalAgreement.step3.addTenant')"
      icon="pi pi-plus"
      severity="secondary"
      outlined
      @click="addTenant"
    />

    <!-- Action Buttons -->
    <div class="flex justify-between gap-3 mt-6">
      <Button
        type="button"
        :label="t('rentalAgreement.step3.backButton')"
        icon="pi pi-arrow-left"
        severity="secondary"
        @click="emit('back')"
      />
      <Button
        type="button"
        :label="t('rentalAgreement.step3.nextButton')"
        icon="pi pi-arrow-right"
        iconPos="right"
        :disabled="!isValid"
        @click="goNext"
      />
    </div>
  </div>
</template>
