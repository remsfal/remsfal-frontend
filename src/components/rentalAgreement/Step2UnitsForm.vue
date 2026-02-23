<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import TreeSelect from 'primevue/treeselect';
import type { TreeNode } from 'primevue/treenode';

// Services & Types
import { propertyService, type RentalUnitTreeNodeJson, type UnitType } from '@/services/PropertyService';
import type { ApiComponents } from '@/services/ApiClient';

// Components
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

const { t } = useI18n();

// State
const propertyTree = ref<TreeNode[]>([]);
const selectedNodeKey = ref<string | null>(null);
const isLoadingTree = ref(false);

// Current unit being edited (before adding to list)
const currentUnit = ref<{
  unitId: string;
  unitType: UnitType;
  unitTitle: string;
} | null>(null);

// Transform RentalUnitTreeNodeJson to TreeSelect format
function transformTreeNodes(nodes: RentalUnitTreeNodeJson[]): TreeNode[] {
  return nodes.map((node) => {
    const unitType = node.data?.type ? t(`unitTypes.${node.data.type.toLowerCase()}`) : '';
    const title = node.data?.title || 'Unbenannt';

    return {
      key: node.key,
      label: `${title} (${unitType})`,
      data: node.data,
      children: node.children ? transformTreeNodes(node.children) : undefined,
      // All units with a type are selectable (except PROPERTY which is a container)
      selectable: node.data?.type !== undefined &&
                  node.data.type !== 'PROPERTY',
    };
  });
}

// Load Property Tree
onMounted(async () => {
  isLoadingTree.value = true;
  try {
    const data = await propertyService.getPropertyTree(props.projectId);
    const rawTree = (data.properties || []) as RentalUnitTreeNodeJson[];
    propertyTree.value = transformTreeNodes(rawTree);
  } catch (error) {
    console.error('Failed to load property tree:', error);
  } finally {
    isLoadingTree.value = false;
  }
});

// When TreeSelect selection changes
function onUnitSelected(node: TreeNode) {
  if (!node || !node.data) {
    currentUnit.value = null;
    return;
  }

  const alreadyAdded = props.selectedUnits.some((u) => u.unitId === node.key);
  if (alreadyAdded) {
    selectedNodeKey.value = null;
    currentUnit.value = null;
    return;
  }

  currentUnit.value = {
    unitId: node.key,
    unitType: node.data.type as UnitType,
    unitTitle: node.data.title || 'Unbenannt',
  };
}

// Handle rental details form submission
function onRentalDetailsSubmit(details: RentalDetails) {
  if (!currentUnit.value) return;

  const unit: SelectedUnit = {
    unitId: currentUnit.value.unitId,
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
      <TreeSelect
        v-model="selectedNodeKey"
        :options="propertyTree"
        :loading="isLoadingTree"
        :placeholder="t('rentalAgreement.step2.selectUnit')"
        selectionMode="single"
        fluid
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
        :key="unit.unitId"
        class="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
      >
        <div class="flex-1">
          <p class="font-semibold">
            {{ unit.unitTitle }}
          </p>
          <p class="text-sm text-gray-600">
            {{ t(`unitTypes.${unit.unitType.toLowerCase()}`) }}
            <span v-if="unit.basicRent !== undefined">
              • {{ t('rentalAgreement.step2.basicRent') }} {{ unit.basicRent.toFixed(2) }} €
            </span>
            <span v-if="unit.operatingCostsPrepayment !== undefined">
              • {{ t('rentalAgreement.step2.operatingCosts') }} {{ unit.operatingCostsPrepayment.toFixed(2) }} €
            </span>
            <span v-if="unit.heatingCostsPrepayment !== undefined">
              • {{ t('rentalAgreement.step2.heatingCosts') }} {{ unit.heatingCostsPrepayment.toFixed(2) }} €
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
