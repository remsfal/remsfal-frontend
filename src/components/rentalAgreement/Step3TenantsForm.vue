<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import Message from 'primevue/message';
import AutoComplete from 'primevue/autocomplete';

// Services & Types
import { tenantService, type TenantItemJson as TenantItemFromList } from '@/services/TenantService';
import type { TenantJson } from '@/services/RentalAgreementService';

// Components
import TenantForm from './TenantForm.vue';

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
const allTenants = ref<TenantItemFromList[]>([]);
const isLoadingTenants = ref(false);
const filteredTenants = ref<TenantItemFromList[]>([]);
const selectedExistingTenant = ref<TenantItemFromList | null>(null);
const showTenantForm = ref(false);

// Type for AutoComplete options with label
type TenantOption = TenantItemFromList & { label: string };

// Computed property for TenantOptions with label
const tenantOptions = computed<TenantOption[]>(() =>
  filteredTenants.value.map((t) => ({
    ...t,
    label: `${t.firstName} ${t.lastName}${t.email ? ` (${t.email})` : ''}`,
  })),
);

// Load tenants on mount
onMounted(async () => {
  isLoadingTenants.value = true;
  try {
    allTenants.value = await tenantService.fetchTenants(props.projectId);
  } catch (error) {
    console.error('Failed to load tenants:', error);
  } finally {
    isLoadingTenants.value = false;
  }
});

// AutoComplete Filter Function
const searchTenants = (event: { query: string }) => {
  const query = event.query.toLowerCase().trim();

  if (!query) {
    filteredTenants.value = allTenants.value;
    return;
  }

  filteredTenants.value = allTenants.value.filter(
    (t) =>
      t.firstName?.toLowerCase().includes(query) ||
      t.lastName?.toLowerCase().includes(query) ||
      t.email?.toLowerCase().includes(query),
  );
};

// When existing tenant is selected from AutoComplete
const onTenantSelected = (tenant: TenantItemFromList | null) => {
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

  // Convert TenantItemFromList to TenantJson (add missing fields as undefined)
  const tenantForRental: TenantJson = {
    id: tenant.id,
    firstName: tenant.firstName,
    lastName: tenant.lastName,
    email: tenant.email,
    mobilePhoneNumber: tenant.mobilePhoneNumber,
    businessPhoneNumber: tenant.businessPhoneNumber,
    privatePhoneNumber: tenant.privatePhoneNumber,
    // These fields are not in TenantItemFromList but are in TenantItem
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
        <AutoComplete
          v-model="selectedExistingTenant"
          :suggestions="tenantOptions"
          :loading="isLoadingTenants"
          :placeholder="t('rentalAgreement.step3.searchTenant')"
          :emptySearchMessage="t('rentalAgreement.step3.noTenants')"
          dataKey="id"
          optionLabel="label"
          fluid
          dropdown
          @complete="searchTenants"
          @update:modelValue="onTenantSelected"
        >
          <template #option="slotProps">
            <div class="flex flex-col">
              <span class="font-semibold">{{ slotProps.option.firstName }} {{ slotProps.option.lastName }}</span>
              <span v-if="slotProps.option.email" class="text-sm text-gray-600">{{ slotProps.option.email }}</span>
            </div>
          </template>
        </AutoComplete>
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
