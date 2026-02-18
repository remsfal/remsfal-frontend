<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import AutoComplete from 'primevue/autocomplete';
import Message from 'primevue/message';

// Types
import type { Type } from '@/services/IssueService';
import type { TenancyJson, RentalUnitJson } from '@/services/TenancyService';
import { formatTenancyLabel } from '@/services/TenancyService';

// Category type definition
interface CategoryOption {
  value: string;
  label: string;
  examples?: string;
}

// Props & Emits
const props = defineProps<{
  tenancyId: string | null;
  issueType: Type | null;
  issueCategory: string | null;
  rentalUnitId: string | null;
  tenancies: TenancyJson[];
}>();

const emit = defineEmits<{
  'update:tenancyId': [value: string | null];
  'update:issueType': [value: Type | null];
  'update:issueCategory': [value: string | null];
  'update:rentalUnitId': [value: string | null];
  next: [];
}>();

const { t } = useI18n();

// Type Options
const typeOptions = computed(() => [
  { label: t('tenantIssue.step1.typeDefect'), value: 'DEFECT' },
  { label: t('tenantIssue.step1.typeInquiry'), value: 'INQUIRY' },
  { label: t('tenantIssue.step1.typeTermination'), value: 'TERMINATION' },
]);

// DEFECT Categories with Examples
const DEFECT_CATEGORIES = computed<CategoryOption[]>(() => [
  {
    value: 'BLOCKED_DRAIN',
    label: t('tenantIssue.categories.BLOCKED_DRAIN'),
    examples: t('tenantIssue.categoryExamples.BLOCKED_DRAIN'),
  },
  {
    value: 'ELECTRICAL_FAULT',
    label: t('tenantIssue.categories.ELECTRICAL_FAULT'),
    examples: t('tenantIssue.categoryExamples.ELECTRICAL_FAULT'),
  },
  {
    value: 'FIRE_DAMAGE',
    label: t('tenantIssue.categories.FIRE_DAMAGE'),
    examples: t('tenantIssue.categoryExamples.FIRE_DAMAGE'),
  },
  {
    value: 'HEATING_SYSTEM_MALFUNCTION',
    label: t('tenantIssue.categories.HEATING_SYSTEM_MALFUNCTION'),
    examples: t('tenantIssue.categoryExamples.HEATING_SYSTEM_MALFUNCTION'),
  },
  {
    value: 'PEST_INFESTATION',
    label: t('tenantIssue.categories.PEST_INFESTATION'),
    examples: t('tenantIssue.categoryExamples.PEST_INFESTATION'),
  },
  {
    value: 'POLLUTION_INSIDE_BUILDING',
    label: t('tenantIssue.categories.POLLUTION_INSIDE_BUILDING'),
    examples: t('tenantIssue.categoryExamples.POLLUTION_INSIDE_BUILDING'),
  },
  {
    value: 'POLLUTION_OUTSIDE_BUILDING',
    label: t('tenantIssue.categories.POLLUTION_OUTSIDE_BUILDING'),
    examples: t('tenantIssue.categoryExamples.POLLUTION_OUTSIDE_BUILDING'),
  },
  {
    value: 'SANITARY_SYSTEM_DAMAGE',
    label: t('tenantIssue.categories.SANITARY_SYSTEM_DAMAGE'),
    examples: t('tenantIssue.categoryExamples.SANITARY_SYSTEM_DAMAGE'),
  },
  {
    value: 'ROLLER_SHUTTER_DAMAGE',
    label: t('tenantIssue.categories.ROLLER_SHUTTER_DAMAGE'),
    examples: t('tenantIssue.categoryExamples.ROLLER_SHUTTER_DAMAGE'),
  },
  {
    value: 'WATER_DAMAGE',
    label: t('tenantIssue.categories.WATER_DAMAGE'),
    examples: t('tenantIssue.categoryExamples.WATER_DAMAGE'),
  },
  {
    value: 'GENERAL',
    label: t('tenantIssue.categories.GENERAL'),
    examples: t('tenantIssue.categoryExamples.GENERAL'),
  },
]);

// INQUIRY Categories
const INQUIRY_CATEGORIES = computed<CategoryOption[]>(() => [
  {
    value: 'CERTIFICATE_OF_NO_RENT_ARREARS',
    label: t('tenantIssue.categories.CERTIFICATE_OF_NO_RENT_ARREARS'),
  },
  {
    value: 'CONFIRMATION_OF_RESIDENCE',
    label: t('tenantIssue.categories.CONFIRMATION_OF_RESIDENCE'),
  },
  {
    value: 'GENERAL',
    label: t('tenantIssue.categories.GENERAL'),
  },
]);

// Get categories based on type
const availableCategories = computed<CategoryOption[]>(() => {
  if (props.issueType === 'DEFECT') {
    return DEFECT_CATEGORIES.value;
  }
  if (props.issueType === 'INQUIRY') {
    return INQUIRY_CATEGORIES.value;
  }
  return []; // TERMINATION has no categories
});

// AutoComplete state
const filteredCategories = ref<CategoryOption[]>([]);

// Get category label from value
const selectedCategoryLabel = computed(() => {
  if (!props.issueCategory) return null;
  const category = availableCategories.value.find(c => c.value === props.issueCategory);
  return category?.label || props.issueCategory;
});

// AutoComplete search
function searchCategories(event: { query: string }) {
  const query = event.query.toLowerCase();

  if (!query) {
    filteredCategories.value = availableCategories.value;
    return;
  }

  filteredCategories.value = availableCategories.value.filter(cat =>
    cat.label.toLowerCase().includes(query) ||
    (cat.examples && cat.examples.toLowerCase().includes(query))
  );
}

// Handle category selection
function onCategorySelect(event: CategoryOption) {
  emit('update:issueCategory', event.value);
}

// Handle manual input
function onCategoryChange(value: CategoryOption | string | null) {
  if (!value) {
    emit('update:issueCategory', null);
  } else if (typeof value === 'string') {
    const match = availableCategories.value.find(c => c.label === value);
    emit('update:issueCategory', match?.value || null);
  } else {
    emit('update:issueCategory', value.value);
  }
}

// Local state for form fields
const localTenancyId = ref(props.tenancyId);
const localIssueType = ref(props.issueType);
const localRentalUnitId = ref(props.rentalUnitId);

// Watch type changes to reset category
watch(() => props.issueType, (newType) => {
  if (newType === 'TERMINATION') {
    emit('update:issueCategory', null);
  }
});

// Reset rental unit when tenancy changes
watch(localTenancyId, () => {
  localRentalUnitId.value = null;
  emit('update:rentalUnitId', null);
});

// Tenancy select options
const tenancyOptions = computed(() =>
  props.tenancies.map(tenancy => ({
    label: formatTenancyLabel(tenancy),
    value: tenancy.agreementId,
  }))
);

// Check if only one tenancy
const hasOnlyOneTenancy = computed(() => props.tenancies.length === 1);

// Currently selected tenancy object
const selectedTenancy = computed<TenancyJson | undefined>(() =>
  props.tenancies.find(t => t.agreementId === localTenancyId.value)
);

// Rental unit options for the selected tenancy
const rentalUnitOptions = computed(() => {
  const units = selectedTenancy.value?.rentalUnits ?? [];
  return units.map((unit: RentalUnitJson) => ({
    label: unit.title || unit.location || unit.type || 'Einheit',
    value: unit.id,
  }));
});

const hasRentalUnits = computed(() =>
  !!localTenancyId.value && rentalUnitOptions.value.length > 0
);

// Validation
const canProceed = computed(() => {
  return !!(
    localTenancyId.value &&
    localIssueType.value &&
    (localIssueType.value === 'TERMINATION' || props.issueCategory)
  );
});

// Handle next
function handleNext() {
  if (!canProceed.value) return;

  emit('update:tenancyId', localTenancyId.value);
  emit('update:issueType', localIssueType.value);
  emit('update:rentalUnitId', localRentalUnitId.value);
  emit('next');
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h3 class="text-xl font-semibold">
      {{ t('tenantIssue.step1.title') }}
    </h3>

    <div class="flex flex-col gap-6">
      <!-- Tenancy Selection -->
      <div class="flex flex-col gap-2">
        <label for="tenancyId" class="font-semibold">
          {{ t('tenantIssue.step1.tenancyLabel') }} *
        </label>
        <Select
          id="tenancyId"
          v-model="localTenancyId"
          :options="tenancyOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('tenantIssue.step1.tenancyPlaceholder')"
          :disabled="hasOnlyOneTenancy"
          fluid
          autofocus
        />
      </div>

      <!-- Type Selection -->
      <div class="flex flex-col gap-2">
        <label for="issueType" class="font-semibold">
          {{ t('tenantIssue.step1.typeLabel') }} *
        </label>
        <SelectButton
          id="issueType"
          v-model="localIssueType"
          :options="typeOptions"
          optionLabel="label"
          optionValue="value"
          :allowEmpty="false"
          class="flex flex-col sm:flex-row gap-2"
        />
      </div>

      <!-- Category Selection (conditional) -->
      <div v-if="localIssueType && localIssueType !== 'TERMINATION'" class="flex flex-col gap-2">
        <label for="issueCategory" class="font-semibold">
          {{ t('tenantIssue.step1.categoryLabel') }} *
        </label>

        <AutoComplete
          id="issueCategory"
          :modelValue="selectedCategoryLabel"
          :suggestions="filteredCategories"
          optionLabel="label"
          :placeholder="t('tenantIssue.step1.categoryPlaceholder')"
          fluid
          dropdown
          forceSelection
          @complete="searchCategories"
          @itemSelect="onCategorySelect"
          @update:modelValue="onCategoryChange"
        >
          <template #option="{ option }">
            <div class="flex flex-col">
              <span class="font-semibold">{{ option.label }}</span>
              <span v-if="option.examples" class="text-sm text-gray-500">{{ option.examples }}</span>
            </div>
          </template>
        </AutoComplete>

        <Message severity="info" size="small" variant="simple">
          {{ t('tenantIssue.step1.categoryHint') }}
        </Message>
      </div>

      <!-- Rental Unit Selection (optional) -->
      <div v-if="hasRentalUnits" class="flex flex-col gap-2">
        <label for="rentalUnitId" class="font-semibold">
          {{ t('tenantIssue.step1.rentalUnitLabel') }}
        </label>
        <Select
          id="rentalUnitId"
          v-model="localRentalUnitId"
          :options="rentalUnitOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('tenantIssue.step1.rentalUnitPlaceholder')"
          showClear
          fluid
        />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-3 mt-6">
      <Button
        type="button"
        :label="t('tenantIssue.step1.nextButton')"
        icon="pi pi-arrow-right"
        iconPos="right"
        :disabled="!canProceed"
        @click="handleNext"
      />
    </div>
  </div>
</template>
