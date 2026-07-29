<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
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
  // Raw agreement id from the caller (e.g. IssueJson.agreementId) to resolve against
  // the list this component already loads, instead of the caller fetching it again.
  initialAgreementId?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: RentalAgreementItemJson | null];
  resolved: [value: RentalAgreementItemJson | null];
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

function toOption(agreement: RentalAgreementItemJson): AgreementOption {
  const unit = unitLabelFor(agreement);
  const tenants = tenantNamesFor(agreement);
  return { ...agreement, label: unit ? `${tenants} (${unit})` : tenants };
}

// Computed property for AutoComplete options with a synthetic display label
const agreementOptions = computed<AgreementOption[]>(() =>
  filteredAgreements.value.map(toOption),
);

// The bound modelValue may come from the caller without a synthetic `label`
// (e.g. resolved via `initialAgreementId`); always derive the display value
// here so AutoComplete never falls back to rendering the raw object.
const displayValue = computed<AgreementOption | null>(() =>
  props.modelValue ? toOption(props.modelValue) : null,
);

// Resolves `initialAgreementId` against the already-loaded list, so callers
// don't need to fetch rental agreements a second time just to turn a raw id
// into the full object RentalAgreementSelect requires as its v-model.
function resolveInitialAgreement() {
  if (!props.initialAgreementId) {
    emit('resolved', null);
    return;
  }
  const match = allAgreements.value.find((agreement) => agreement.id === props.initialAgreementId) ?? null;
  emit('resolved', match ? toOption(match) : null);
}

// Load rental agreements on mount
onMounted(async () => {
  isLoading.value = true;
  try {
    allAgreements.value = await rentalAgreementService.getRentalAgreements(props.projectId);
    filteredAgreements.value = allAgreements.value;
    resolveInitialAgreement();
  } catch (error) {
    console.error('Failed to load rental agreements:', error);
  } finally {
    isLoading.value = false;
  }
});

watch(() => props.initialAgreementId, () => resolveInitialAgreement());

// AutoComplete (non-multiple) emits update:modelValue for the transient text
// the user is typing while searching too, not only for a genuine selection —
// it's a raw string, not an agreement. Forwarding it would round-trip through
// `displayValue`/toOption() below and overwrite the input with the
// "unknown tenant" fallback label as soon as a letter is typed. Only forward
// real selections (an agreement object) or an explicit clear (null).
function onModelValueUpdate(value: AgreementOption | string | null) {
  if (typeof value === 'string') return;
  emit('update:modelValue', value);
}

// AutoComplete Filter Function (client-side, no search endpoint exists)
const searchAgreements = (event: { query: string }) => {
  const query = event.query.toLowerCase().trim();

  if (!query) {
    // Always assign a new array reference: AutoComplete only opens its
    // overlay when its `suggestions` prop changes, so reusing the exact
    // same array (e.g. on the very first dropdown click, before any
    // filtering happened) would silently no-op and leave the dropdown closed.
    filteredAgreements.value = [...allAgreements.value];
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
    :modelValue="displayValue"
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
    @update:modelValue="onModelValueUpdate"
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
