<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import SelectButton from 'primevue/selectbutton';
import TreeSelect from 'primevue/treeselect';
import InputNumber from 'primevue/inputnumber';
import DatePicker from 'primevue/datepicker';
import type { TreeNode } from 'primevue/treenode';

// Services & Types
import { propertyService, type RentableUnitTreeNode, type UnitType } from '@/services/PropertyService';
import type { ApiComponents } from '@/services/ApiClient';

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

// Billing Cycle Options
const billingCycleOptions = [
  { label: t('billingCycle.monthly'), value: 'MONTHLY' },
  { label: t('billingCycle.weekly'), value: 'WEEKLY' },
];

// State
const propertyTree = ref<TreeNode[]>([]);
const selectedNodeKey = ref<string | null>(null);
const isLoadingTree = ref(false);

// Current unit being edited (before adding to list)
const currentUnit = ref<SelectedUnit | null>(null);

// Transform RentableUnitTreeNode to TreeSelect format
function transformTreeNodes(nodes: RentableUnitTreeNode[]): TreeNode[] {
  return nodes.map((node) => {
    const unitType = node.data?.type ? t(`unitTypes.${node.data.type.toLowerCase()}`) : '';
    const title = node.data?.title || 'Unbenannt';

    return {
      key: node.key,
      label: `${title} (${unitType})`,
      data: node.data,
      children: node.children ? transformTreeNodes(node.children) : undefined,
      // Only leaf nodes (apartments, commercial, storage) are selectable
      selectable: node.data?.type === 'APARTMENT' ||
                  node.data?.type === 'COMMERCIAL' ||
                  node.data?.type === 'STORAGE',
    };
  });
}

// Load Property Tree
onMounted(async () => {
  isLoadingTree.value = true;
  try {
    const data = await propertyService.getPropertyTree(props.projectId);
    const rawTree = (data.properties || []) as RentableUnitTreeNode[];
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
    unitType: node.data.type as SelectedUnit['unitType'],
    unitTitle: node.data.title || 'Unbenannt',
    basicRent: undefined,
    operatingCostsPrepayment: undefined,
    heatingCostsPrepayment: undefined,
    billingCycle: 'MONTHLY',
    firstPaymentDate: props.startOfRental ?? undefined,
    lastPaymentDate: props.endOfRental ?? undefined,
  };
}

// Add current unit to saved list and reset form
function addAnotherUnit() {
  if (!currentUnit.value) return;

  // Add to saved units
  emit('update:selectedUnits', [...props.selectedUnits, currentUnit.value]);

  // Reset form
  selectedNodeKey.value = null;
  currentUnit.value = null;
}

// Remove saved unit
function removeUnit(index: number) {
  const updated = props.selectedUnits.filter((_, i) => i !== index);
  emit('update:selectedUnits', updated);
}

// Convert Date to ISO string (YYYY-MM-DD format for LocalDate)
function toISODateString(date: Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = date instanceof Date ? date : new Date(date);
  return d ? (d.toISOString().split('T')[0] as string) : undefined;
}

// Convert ISO string to Date for DatePicker display
function toDateObject(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  return new Date(dateString);
}

// Validation: At least one unit required
const canProceed = computed(() => {
  // Can proceed if we have saved units OR current unit is filled
  return props.selectedUnits.length > 0 || currentUnit.value !== null;
});

const canAddAnother = computed(() => {
  return currentUnit.value !== null;
});

// Go to Next Step
function goNext() {
  // If we have a current unit that hasn't been saved, save it first
  if (currentUnit.value) {
    emit('update:selectedUnits', [...props.selectedUnits, currentUnit.value]);
    currentUnit.value = null;
    selectedNodeKey.value = null;
  }

  if (props.selectedUnits.length > 0 || currentUnit.value) {
    emit('next');
  }
}
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

    <!-- Current Unit Detail Form (shown when unit is selected) -->
    <div v-if="currentUnit" class="p-4 border rounded-lg bg-blue-50">
      <h4 class="font-semibold mb-4">
        {{ currentUnit.unitTitle }}
      </h4>
      <p class="text-sm text-gray-600 mb-4">
        {{ t(`unitTypes.${currentUnit.unitType.toLowerCase()}`) }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Basic Rent -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step2.basicRent') }}
          </label>
          <InputNumber
            v-model="currentUnit.basicRent"
            :min="0"
            :maxFractionDigits="2"
            mode="currency"
            currency="EUR"
            locale="de-DE"
            fluid
          />
        </div>

        <!-- Billing Cycle -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step2.billingCycle') }}
          </label>
          <SelectButton
            v-model="currentUnit.billingCycle"
            :options="billingCycleOptions"
            optionLabel="label"
            optionValue="value"
            fluid
            class="w-full"
          />
        </div>

        <!-- Operating Costs -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step2.operatingCosts') }}
          </label>
          <InputNumber
            v-model="currentUnit.operatingCostsPrepayment"
            :min="0"
            :maxFractionDigits="2"
            mode="currency"
            currency="EUR"
            locale="de-DE"
            fluid
          />
        </div>

        <!-- Heating Costs -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step2.heatingCosts') }}
          </label>
          <InputNumber
            v-model="currentUnit.heatingCostsPrepayment"
            :min="0"
            :maxFractionDigits="2"
            mode="currency"
            currency="EUR"
            locale="de-DE"
            fluid
          />
        </div>

        <!-- First Payment Date -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step2.firstPayment') }}
          </label>
          <DatePicker
            :modelValue="toDateObject(currentUnit.firstPaymentDate)"
            dateFormat="dd.mm.yy"
            showIcon
            fluid
            @update:modelValue="currentUnit.firstPaymentDate = toISODateString(Array.isArray($event) ? $event[0] : $event)"
          />
        </div>

        <!-- Last Payment Date -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">
            {{ t('rentalAgreement.step2.lastPayment') }}
          </label>
          <DatePicker
            :modelValue="toDateObject(currentUnit.lastPaymentDate)"
            dateFormat="dd.mm.yy"
            showIcon
            fluid
            @update:modelValue="currentUnit.lastPaymentDate = toISODateString(Array.isArray($event) ? $event[0] : $event)"
          />
        </div>

        <!-- Add Unit Button -->
        <div class="flex flex-col gap-2 justify-end">
          <Button
            type="button"
            :label="t('rentalAgreement.step2.addUnit')"
            icon="pi pi-plus"
            :disabled="!canAddAnother"
            @click="addAnotherUnit"
          />
        </div>
      </div>
    </div>

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

      <div class="flex gap-3">
        <Button
          type="button"
          :label="t('rentalAgreement.step2.nextButton')"
          icon="pi pi-arrow-right"
          iconPos="right"
          :disabled="!canProceed"
          @click="goNext"
        />
      </div>
    </div>
  </div>
</template>
