<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import AutoComplete from 'primevue/autocomplete';

// Services & Types
import { rentalAgreementService, type RentalAgreementItemJson } from '../services/RentalAgreementService';

// Props & Emits
const props = defineProps<{
  projectId: string;
  modelValue: RentalAgreementItemJson | null;
  invalid?: boolean;
  inputId?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: RentalAgreementItemJson | null];
  blur: [];
}>();

const { t } = useI18n();

// State
const allAgreements = ref<RentalAgreementItemJson[]>([]);
const filteredAgreements = ref<RentalAgreementItemJson[]>([]);
const isLoading = ref(false);

type AgreementOption = RentalAgreementItemJson & { label: string };

function tenantNamesFor(agreement: RentalAgreementItemJson): string {
  const names = (agreement.tenants ?? [])
    .map((tenant) => `${tenant.firstName ?? ''} ${tenant.lastName ?? ''}`.trim())
    .filter(Boolean);
  return names.length ? names.join(', ') : t('rentalAgreementSelect.unknownTenant');
}

function unitLabelFor(agreement: RentalAgreementItemJson): string {
  return (agreement.rentalUnits ?? [])
    .map((unit) => unit.title || unit.location)
    .filter((value): value is string => Boolean(value))
    .join(', ');
}

// Computed property for AutoComplete options with a synthetic display label
const agreementOptions = computed<AgreementOption[]>(() =>
  filteredAgreements.value.map((agreement) => {
    const unit = unitLabelFor(agreement);
    const tenants = tenantNamesFor(agreement);
    return { ...agreement, label: unit ? `${tenants} (${unit})` : tenants };
  }),
);

// Load rental agreements on mount
onMounted(async () => {
  isLoading.value = true;
  try {
    allAgreements.value = await rentalAgreementService.getRentalAgreements(props.projectId);
    filteredAgreements.value = allAgreements.value;
  } catch (error) {
    console.error('Failed to load rental agreements:', error);
  } finally {
    isLoading.value = false;
  }
});

// AutoComplete Filter Function (client-side, no search endpoint exists)
const searchAgreements = (event: { query: string }) => {
  const query = event.query.toLowerCase().trim();

  if (!query) {
    filteredAgreements.value = allAgreements.value;
    return;
  }

  filteredAgreements.value = allAgreements.value.filter((agreement) => {
    const tenantMatch = (agreement.tenants ?? []).some(
      (tenant) =>
        tenant.firstName?.toLowerCase().includes(query) ||
        tenant.lastName?.toLowerCase().includes(query),
    );
    const unitMatch = (agreement.rentalUnits ?? []).some(
      (unit) =>
        unit.title?.toLowerCase().includes(query) || unit.location?.toLowerCase().includes(query),
    );
    return tenantMatch || unitMatch;
  });
};
</script>

<template>
  <AutoComplete
    :inputId="inputId"
    :modelValue="modelValue"
    :suggestions="agreementOptions"
    :loading="isLoading"
    :placeholder="t('rentalAgreementSelect.placeholder')"
    :emptySearchMessage="t('rentalAgreementSelect.empty')"
    dataKey="id"
    optionLabel="label"
    :class="{ 'p-invalid': invalid }"
    forceSelection
    fluid
    dropdown
    @complete="searchAgreements"
    @update:modelValue="emit('update:modelValue', $event)"
    @blur="emit('blur')"
  >
    <template #option="slotProps">
      <div class="flex flex-col">
        <span class="font-semibold">{{ tenantNamesFor(slotProps.option) }}</span>
        <span v-if="unitLabelFor(slotProps.option)" class="text-sm text-gray-600">
          {{ unitLabelFor(slotProps.option) }}
        </span>
      </div>
    </template>
  </AutoComplete>
</template>
