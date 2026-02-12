<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import AutoComplete from 'primevue/autocomplete';

// Services & Types
import { tenantService, type TenantItem as TenantItemFromList } from '@/services/TenantService';
import type { TenantItem } from '@/services/RentalAgreementService';

// Re-export for parent components
export type { TenantItem };

// Props & Emits
const props = defineProps<{
  projectId: string;
  tenants: TenantItem[];
}>();

const emit = defineEmits<{
  'update:tenants': [value: TenantItem[]];
  back: [];
  next: [];
}>();

const { t } = useI18n();

// State
const allTenants = ref<TenantItemFromList[]>([]);
const isLoadingTenants = ref(false);
const filteredTenants = ref<TenantItemFromList[]>([]);
const selectedExistingTenant = ref<TenantItemFromList | null>(null);
const currentTenant = ref<TenantItem | null>(null);
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
    currentTenant.value = null;
    showTenantForm.value = false;
    return;
  }

  // Check if tenant already added
  const alreadyAdded = props.tenants.some((t) => t.id === tenant.id);
  if (alreadyAdded) {
    selectedExistingTenant.value = null;
    currentTenant.value = null;
    showTenantForm.value = false;
    return;
  }

  // Convert TenantItemFromList to TenantItem (add missing fields as undefined)
  const tenantForRental: TenantItem = {
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
  currentTenant.value = {
    firstName: '',
    lastName: '',
  };
  showTenantForm.value = true;
  selectedExistingTenant.value = null;
};

// Add current tenant to list
const addTenantToList = () => {
  if (!currentTenant.value) return;

  // Validation
  if (!currentTenant.value.firstName.trim() || !currentTenant.value.lastName.trim()) {
    return;
  }

  emit('update:tenants', [...props.tenants, currentTenant.value]);

  // Reset
  currentTenant.value = null;
  showTenantForm.value = false;
};

// Remove tenant from list
const removeTenant = (index: number) => {
  const updated = props.tenants.filter((_, i) => i !== index);
  emit('update:tenants', updated);
};

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

// Format date for display
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

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

// Validation
const canProceed = computed(() => {
  return props.tenants.length > 0;
});

const canAddToList = computed(() => {
  return (
    currentTenant.value !== null &&
    currentTenant.value.firstName.trim() !== '' &&
    currentTenant.value.lastName.trim() !== ''
  );
});
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

    <!-- Current Tenant Form (shown when adding new tenant) -->
    <div v-if="showTenantForm && currentTenant" class="p-4 border rounded-lg bg-blue-50">
      <h4 class="font-semibold mb-4">
        {{ t('rentalAgreement.step3.newTenantDetails') }}
      </h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- First Name -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.firstName') }} *
          </label>
          <InputText
            v-model="currentTenant.firstName"
            type="text"
            :class="{ 'p-invalid': !currentTenant.firstName.trim() }"
            fluid
          />
        </div>

        <!-- Last Name -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.lastName') }} *
          </label>
          <InputText
            v-model="currentTenant.lastName"
            type="text"
            :class="{ 'p-invalid': !currentTenant.lastName.trim() }"
            fluid
          />
        </div>

        <!-- Email -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.email') }}
          </label>
          <InputText
            v-model="currentTenant.email"
            type="email"
            :class="{ 'p-invalid': currentTenant.email && !validateEmail(currentTenant.email) }"
            fluid
          />
        </div>

        <!-- Mobile Phone -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.mobilePhone') }}
          </label>
          <InputText
            v-model="currentTenant.mobilePhoneNumber"
            type="tel"
            placeholder="+491234567890"
            :class="{ 'p-invalid': currentTenant.mobilePhoneNumber && !validatePhone(currentTenant.mobilePhoneNumber) }"
            fluid
          />
        </div>

        <!-- Business Phone -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.businessPhone') }}
          </label>
          <InputText
            v-model="currentTenant.businessPhoneNumber"
            type="tel"
            placeholder="+491234567890"
            :class="{ 'p-invalid': currentTenant.businessPhoneNumber && !validatePhone(currentTenant.businessPhoneNumber) }"
            fluid
          />
        </div>

        <!-- Private Phone -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.privatePhone') }}
          </label>
          <InputText
            v-model="currentTenant.privatePhoneNumber"
            type="tel"
            placeholder="+491234567890"
            :class="{ 'p-invalid': currentTenant.privatePhoneNumber && !validatePhone(currentTenant.privatePhoneNumber) }"
            fluid
          />
        </div>

        <!-- Place of Birth -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.placeOfBirth') }}
          </label>
          <InputText
            v-model="currentTenant.placeOfBirth"
            type="text"
            fluid
          />
        </div>

        <!-- Date of Birth -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step3.dateOfBirth') }}
          </label>
          <DatePicker
            :modelValue="toDateObject(currentTenant.dateOfBirth)"
            dateFormat="dd.mm.yy"
            showIcon
            fluid
            @update:modelValue="currentTenant.dateOfBirth = toISODateString(Array.isArray($event) ? $event[0] : $event)"
          />
        </div>

        <!-- Add Tenant Button -->
        <div class="flex flex-col gap-2 justify-end md:col-span-2">
          <Button
            type="button"
            :label="t('rentalAgreement.step3.addTenantToList')"
            icon="pi pi-check"
            :disabled="!canAddToList"
            @click="addTenantToList"
          />
        </div>
      </div>
    </div>

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
