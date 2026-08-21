<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import type { TreeNode } from 'primevue/treenode';

// Services & Types
import type { UnitType } from '@/features/project/rentableUnits/services/PropertyService';
import type { ApiComponents } from '@/services/ApiClient';

// Components
import RentableUnitSelect from '@/features/project/rentableUnits/components/RentableUnitSelect.vue';
import RentalDetailsForm, { type RentalDetails } from './RentalDetailsForm.vue';

// Extract RentJson from API schema
type RentJson = ApiComponents['schemas']['RentJson'];

// Extend RentJson with additional UI-specific fields
export interface SelectedUnit extends RentJson {
  unitType: UnitType;
  unitTitle: string;
}

// Props & Emits
const props = defineProps<{
  projectId: string;
  selectedUnits: SelectedUnit[];
  startOfRental: string | null;
  endOfRental: string | null;
}>();

const emit = defineEmits<{
  'update:selectedUnits': [value: SelectedUnit[]];
  back: [];
  next: [];
}>();

const { t, n } = useI18n();

// State
const selectedNodeKey = ref<string | null>(null);

// Current unit being edited (before adding to list)
const currentUnit = ref<{
  rentalUnitId: string;
  unitType: UnitType;
  unitTitle: string;
} | null>(null);

const selectedUnitIds = computed(() => props.selectedUnits.map((u) => u.rentalUnitId));

// When the unit selection changes
function onUnitSelected(node: TreeNode) {
  if (!node || !node.data) {
    currentUnit.value = null;
    return;
  }

  currentUnit.value = {
    rentalUnitId: node.key,
    unitType: node.data.type as UnitType,
    unitTitle: node.data.title || 'Unbenannt',
  };
}

// Handle rental details form submission
function onRentalDetailsSubmit(details: RentalDetails) {
  if (!currentUnit.value) return;

  const unit: SelectedUnit = {
    rentalUnitId: currentUnit.value.rentalUnitId,
    unitType: currentUnit.value.unitType,
    unitTitle: currentUnit.value.unitTitle,
    ...details,
  };

  // Add to saved units
  emit('update:selectedUnits', [...props.selectedUnits, unit]);

  // Reset form
  selectedNodeKey.value = null;
  currentUnit.value = null;
}

// Handle rental details form cancel
function onRentalDetailsCancel() {
  selectedNodeKey.value = null;
  currentUnit.value = null;
}

// Remove saved unit
function removeUnit(index: number) {
  const updated = props.selectedUnits.filter((_, i) => i !== index);
  emit('update:selectedUnits', updated);
}

// Validation
const canProceed = computed(() => {
  return props.selectedUnits.length > 0;
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <h3 class="text-xl font-semibold">
      {{ t('rentalAgreement.step2.title') }}
    </h3>

    <!-- Unit Selection -->
    <div class="flex flex-col gap-2">
      <label for="unitSelector" class="font-semibold">
        {{ t('rentalAgreement.step2.selectUnit') }}
      </label>
      <RentableUnitSelect
        v-model="selectedNodeKey"
        :projectId="projectId"
        :excludeUnitIds="selectedUnitIds"
        inputId="unitSelector"
        @nodeSelect="onUnitSelected"
      />
    </div>

    <!-- Rental Details Form (shown when unit is selected) -->
    <RentalDetailsForm
      v-if="currentUnit"
      :unitTitle="currentUnit.unitTitle"
      :unitType="currentUnit.unitType"
      :initialFirstPaymentDate="startOfRental ?? undefined"
      :initialLastPaymentDate="endOfRental ?? undefined"
      @submit="onRentalDetailsSubmit"
      @cancel="onRentalDetailsCancel"
    />

    <!-- Saved Units (Compact Display) -->
    <div v-if="selectedUnits.length > 0" class="flex flex-col gap-2">
      <h4 class="font-semibold">
        {{ t('rentalAgreement.step4.unitsSection') }}
      </h4>
      <div
        v-for="(unit, index) in selectedUnits"
        :key="unit.rentalUnitId"
        class="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
      >
        <div class="flex-1">
          <p class="font-semibold">
            {{ unit.unitTitle }}
          </p>
          <p class="text-sm text-gray-600">
            {{ t(`unitTypes.${unit.unitType.toLowerCase()}`) }}
            <span v-if="unit.basicRent !== undefined">
              • {{ t('rentalAgreement.common.basicRent') }} {{ n(unit.basicRent, 'currency') }}
            </span>
            <span v-if="unit.operatingCostsPrepayment !== undefined">
              • {{ t('rentalAgreement.common.operatingCosts') }} {{ n(unit.operatingCostsPrepayment, 'currency') }}
            </span>
            <span v-if="unit.heatingCostsPrepayment !== undefined">
              • {{ t('rentalAgreement.common.heatingCosts') }} {{ n(unit.heatingCostsPrepayment, 'currency') }}
            </span>
          </p>
        </div>
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          size="small"
          :aria-label="t('rentalAgreement.step2.removeUnit')"
          @click="removeUnit(index)"
        />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between gap-3 mt-6">
      <Button
        type="button"
        :label="t('rentalAgreement.step2.backButton')"
        icon="pi pi-arrow-left"
        severity="secondary"
        @click="emit('back')"
      />

      <Button
        type="button"
        :label="t('rentalAgreement.step2.nextButton')"
        icon="pi pi-arrow-right"
        iconPos="right"
        :disabled="!canProceed"
        @click="emit('next')"
      />
    </div>
  </div>
</template>
