<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import type { TreeNode } from 'primevue/treenode';
import BaseDialog from '@/components/common/BaseDialog.vue';
import RentableUnitSelect from '@/features/project/rentableUnits/components/RentableUnitSelect.vue';
import type { UnitType } from '@/features/project/rentableUnits/services/PropertyService';
import {rentalAgreementService,
  type RentalAgreementJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';
import RentalDetailsForm, { type RentalDetails } from './RentalDetailsForm.vue';

export interface RentAdjustmentUnit {
  unitId: string;
  unitType: UnitType;
  unitTitle: string;
  basicRent?: number;
  operatingCostsPrepayment?: number;
  heatingCostsPrepayment?: number;
  billingCycle?: 'MONTHLY' | 'WEEKLY';
}

const props = defineProps<{
  visible: boolean;
  projectId: string;
  agreementId?: string;
  unit: RentAdjustmentUnit | null;
  excludeUnitIds?: string[];
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'update:rentalAgreement': [agreement: RentalAgreementJson];
}>();

const { t } = useI18n();
const toast = useToast();

const saving = ref(false);
const selectedNodeKey = ref<string | null>(null);
const selectedNode = ref<TreeNode | null>(null);

const isAddMode = computed(() => !props.unit);

const activeUnit = computed<RentAdjustmentUnit | null>(() => {
  if (props.unit) return props.unit;
  if (!selectedNode.value?.data?.type) return null;
  return {
    unitId: selectedNode.value.key as string,
    unitType: selectedNode.value.data.type as UnitType,
    unitTitle: selectedNode.value.data.title ?? '',
  };
});

const dialogHeader = computed(() => {
  if (props.unit) {
    return t('rentalAgreement.unitsCard.adjustRentDialogTitle', {
      title: props.unit.unitTitle,
      type: t(`unitTypes.${props.unit.unitType.toLowerCase()}`),
    });
  }
  return t('rentalAgreement.unitsCard.addButton');
});

function onNodeSelect(node: TreeNode) {
  selectedNode.value = node;
}

function closeDialog() {
  emit('update:visible', false);
  selectedNodeKey.value = null;
  selectedNode.value = null;
}

async function confirmSubmit(details: RentalDetails) {
  const unit = activeUnit.value;
  if (!unit || !props.agreementId) return;

  saving.value = true;
  try {
    const updated = await rentalAgreementService.addRent(
      props.projectId,
      props.agreementId,
      unit.unitType,
      unit.unitId,
      { ...details, rentalUnitId: unit.unitId },
    );
    emit('update:rentalAgreement', updated);
    toast.add({
      severity: 'success',
      summary: t(
        isAddMode.value ? 'rentalAgreement.unitsCard.success' : 'rentalAgreement.unitsCard.adjustRentSuccess',
      ),
      detail: t(
        isAddMode.value
          ? 'rentalAgreement.unitsCard.successDetail'
          : 'rentalAgreement.unitsCard.adjustRentSuccessDetail',
      ),
      life: 3000,
    });
    closeDialog();
  } catch (error) {
    console.error('Failed to save rent:', error instanceof Error ? error.message : error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t(
        isAddMode.value ? 'rentalAgreement.unitsCard.error' : 'rentalAgreement.unitsCard.adjustRentError',
      ),
      life: 5000,
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <BaseDialog
    :visible="visible"
    :closable="false"
    :header="dialogHeader"
    dialogClass="w-full max-w-2xl"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-4">
      <template v-if="isAddMode">
        <label for="rentalAgreementUnitSelect" class="font-semibold">
          {{ t('rentalAgreement.step2.selectUnit') }}
        </label>
        <RentableUnitSelect
          v-model="selectedNodeKey"
          :projectId="projectId"
          :excludeUnitIds="excludeUnitIds ?? []"
          leafNodeSelectionOnly
          inputId="rentalAgreementUnitSelect"
          @nodeSelect="onNodeSelect"
        />
      </template>

      <RentalDetailsForm
        v-if="activeUnit"
        :initialBasicRent="unit?.basicRent"
        :initialOperatingCostsPrepayment="unit?.operatingCostsPrepayment"
        :initialHeatingCostsPrepayment="unit?.heatingCostsPrepayment"
        :initialBillingCycle="unit?.billingCycle"
        :submitLabel="t(isAddMode ? 'rentalAgreement.unitsCard.confirmAdd' : 'rentalAgreement.unitsCard.adjustRentButton')"
        @submit="confirmSubmit"
        @cancel="closeDialog"
      />
      <div v-else class="flex justify-end gap-2">
        <Button type="button" :label="t('button.cancel')" severity="secondary" @click="closeDialog" />
      </div>
    </div>
  </BaseDialog>
</template>
