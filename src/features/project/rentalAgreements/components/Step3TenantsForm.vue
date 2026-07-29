<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import Message from 'primevue/message';

// Services & Types
import type { TenantItemJson } from '../services/TenantService';
import type { TenantJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';

// Components
import TenantForm from './TenantForm.vue';
import TenantSelect from './TenantSelect.vue';

// Re-export for parent components
export type { TenantJson };

// Props & Emits
const props = defineProps<{
  projectId: string;
  tenants: TenantJson[];
}>();

const emit = defineEmits<{
  'update:tenants': [value: TenantJson[]];
  back: [];
  next: [];
}>();

const { t } = useI18n();

// State
const selectedExistingTenant = ref<TenantItemJson | null>(null);
const showTenantForm = ref(false);

// When existing tenant is selected from TenantSelect
const onTenantSelected = (tenant: TenantItemJson | null) => {
  if (!tenant) {
    showTenantForm.value = false;
    return;
  }

  // Check if tenant already added
  const alreadyAdded = props.tenants.some((t) => t.id === tenant.id);
  if (alreadyAdded) {
    selectedExistingTenant.value = null;
    showTenantForm.value = false;
    return;
  }

  // Convert TenantItemJson to TenantJson (add missing fields as undefined)
  const tenantForRental: TenantJson = {
    id: tenant.id,
    firstName: tenant.firstName,
    lastName: tenant.lastName,
    email: tenant.email,
    mobilePhoneNumber: tenant.mobilePhoneNumber,
    businessPhoneNumber: tenant.businessPhoneNumber,
    privatePhoneNumber: tenant.privatePhoneNumber,
    // These fields are not in TenantItemJson but are in TenantJson
    placeOfBirth: undefined,
    dateOfBirth: undefined,
  };

  // Add tenant directly (no form needed, basic data is complete)
  emit('update:tenants', [...props.tenants, tenantForRental]);
  selectedExistingTenant.value = null;
};

// Add new tenant button clicked
const addNewTenant = () => {
  showTenantForm.value = true;
  selectedExistingTenant.value = null;
};

// Remove tenant from list
const removeTenant = (index: number) => {
  const updated = props.tenants.filter((_, i) => i !== index);
  emit('update:tenants', updated);
};

// Format date for display
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Validation
const canProceed = computed(() => {
  return props.tenants.length > 0;
});

// Handle tenant form submission
const onTenantFormSubmit = (tenant: TenantJson) => {
  emit('update:tenants', [...props.tenants, tenant]);
  showTenantForm.value = false;
};

// Handle tenant form cancel
const onTenantFormCancel = () => {
  showTenantForm.value = false;
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <h3 class="text-xl font-semibold">
      {{ t('rentalAgreement.step3.title') }}
    </h3>

    <!-- Tenant Selection Section -->
    <div class="flex gap-3 items-end">
      <div class="flex-1 flex flex-col gap-2">
        <label for="tenantSelector" class="font-semibold">
          {{ t('rentalAgreement.step3.selectTenant') }}
        </label>
        <TenantSelect
          v-model="selectedExistingTenant"
          inputId="tenantSelector"
          :projectId="projectId"
          @update:modelValue="onTenantSelected"
        />
      </div>

      <Button
        type="button"
        :label="t('rentalAgreement.step3.addNewTenant')"
        icon="pi pi-plus"
        severity="secondary"
        @click="addNewTenant"
      />
    </div>

    <!-- Tenant Form (shown when adding new tenant) -->
    <TenantForm v-if="showTenantForm" @submit="onTenantFormSubmit" @cancel="onTenantFormCancel" />

    <!-- Selected Tenants List (Compact Display) -->
    <div v-if="tenants.length > 0" class="flex flex-col gap-2">
      <h4 class="font-semibold">
        {{ t('rentalAgreement.step3.selectedTenants') }}
      </h4>
      <div
        v-for="(tenant, index) in tenants"
        :key="tenant.id || index"
        class="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
      >
        <div class="flex-1">
          <p class="font-semibold">
            {{ tenant.firstName }} {{ tenant.lastName }}
          </p>
          <p class="text-sm text-gray-600">
            <span v-if="tenant.email">{{ tenant.email }}</span>
            <span v-if="tenant.mobilePhoneNumber"> • {{ tenant.mobilePhoneNumber }}</span>
            <span v-if="tenant.dateOfBirth">
              • {{ t('rentalAgreement.step3.born') }}: {{ formatDate(tenant.dateOfBirth) }}
            </span>
          </p>
        </div>
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          size="small"
          :aria-label="t('rentalAgreement.step3.removeTenant')"
          @click="removeTenant(index)"
        />
      </div>
    </div>

    <!-- Validation Message -->
    <Message
      v-if="tenants.length === 0"
      severity="info"
      size="small"
      variant="simple"
    >
      {{ t('rentalAgreement.validation.oneTenantRequired') }}
    </Message>

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
        :disabled="!canProceed"
        @click="emit('next')"
      />
    </div>
  </div>
</template>
