<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import BaseCard from '@/components/common/BaseCard.vue';
import BaseDialog from '@/components/common/BaseDialog.vue';
import {rentalAgreementService,
  type RentalAgreementJson,
  type RentJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';
import {propertyService,
  toRentableUnitView,
  type UnitType,} from '@/features/project/rentableUnits/services/PropertyService';
import { buildingService } from '@/features/project/rentableUnits/services/BuildingService';
import { apartmentService } from '@/features/project/rentableUnits/services/ApartmentService';
import { commercialService } from '@/features/project/rentableUnits/services/CommercialService';
import { storageService } from '@/features/project/rentableUnits/services/StorageService';
import { siteService } from '@/features/project/rentableUnits/services/SiteService';
import AdjustRentDialog, { type RentAdjustmentUnit } from './AdjustRentDialog.vue';

interface RentRow extends RentJson {
  unitId: string;
  unitType: UnitType;
  unitTitle: string;
}

type GroupedRentRow = RentRow & { rowKey: string };

interface UnitRef {
  unitId: string;
  unitType: UnitType;
  unitTitle: string;
}

const props = defineProps<{
  projectId: string;
  rentalAgreement: RentalAgreementJson;
}>();

const emit = defineEmits<{
  (e: 'update:rentalAgreement', agreement: RentalAgreementJson): void;
}>();

const { t, d, n } = useI18n();
const router = useRouter();
const toast = useToast();

const rentRows = ref<RentRow[]>([]);
const loading = ref(false);
const saving = ref(false);

const RENT_FIELD_BY_TYPE: Record<UnitType, keyof RentalAgreementJson> = {
  PROPERTY: 'propertyRents',
  SITE: 'siteRents',
  BUILDING: 'buildingRents',
  APARTMENT: 'apartmentRents',
  STORAGE: 'storageRents',
  COMMERCIAL: 'commercialRents',
};

function flattenRentEntries(agreement: RentalAgreementJson): Array<{ type: UnitType; rent: RentJson }> {
  return (Object.keys(RENT_FIELD_BY_TYPE) as UnitType[]).flatMap((type) => {
    const field = RENT_FIELD_BY_TYPE[type];
    const rents = (agreement[field] as RentJson[] | undefined) ?? [];
    return rents.map((rent) => ({ type, rent }));
  });
}

async function fetchUnitDetail(
  unitId: string,
  type: UnitType,
): Promise<{ id?: string; title?: string }> {
  switch (type) {
    case 'PROPERTY': return propertyService.getProperty(props.projectId, unitId);
    case 'BUILDING': return buildingService.getBuilding(props.projectId, unitId);
    case 'APARTMENT': return apartmentService.getApartment(props.projectId, unitId);
    case 'COMMERCIAL': return commercialService.getCommercial(props.projectId, unitId);
    case 'STORAGE': return storageService.getStorage(props.projectId, unitId);
    case 'SITE': return siteService.getSite(props.projectId, unitId);
  }
}

async function loadRentRows(agreement: RentalAgreementJson = props.rentalAgreement) {
  loading.value = true;
  try {
    const entries = flattenRentEntries(agreement);

    const typeByUnitId = new Map<string, UnitType>();
    entries.forEach(({ type, rent }) => typeByUnitId.set(rent.rentalUnitId, type));

    const titleByUnitId = new Map<string, string>();
    await Promise.all(
      [...typeByUnitId.entries()].map(async ([unitId, type]) => {
        try {
          const detail = await fetchUnitDetail(unitId, type);
          titleByUnitId.set(unitId, detail.title ?? unitId);
        } catch (error) {
          console.error(`Failed to load unit ${unitId} (${type}):`, error);
          titleByUnitId.set(unitId, unitId);
        }
      }),
    );

    rentRows.value = entries.map(({ type, rent }) => ({
      ...rent,
      unitId: rent.rentalUnitId,
      unitType: type,
      unitTitle: titleByUnitId.get(rent.rentalUnitId) ?? rent.rentalUnitId,
    }));
  } finally {
    loading.value = false;
  }
}

onMounted(() => loadRentRows());

// Pre-grouped/sorted for PrimeVue's rowGroupMode="subheader", which requires rows of the
// same group to be adjacent: by unit title/id, then by payment start descending within the
// unit. This is a fixed grouping rule, not user-controlled sorting, so the DataTable columns
// below are not marked `sortable`.
const groupedRentRows = computed<GroupedRentRow[]>(() => {
  return [...rentRows.value]
    .sort((a, b) => {
      const titleCompare = a.unitTitle.localeCompare(b.unitTitle);
      if (titleCompare !== 0) return titleCompare;
      if (a.unitId !== b.unitId) return a.unitId.localeCompare(b.unitId);
      const aDate = a.firstPaymentDate ? new Date(a.firstPaymentDate).getTime() : 0;
      const bDate = b.firstPaymentDate ? new Date(b.firstPaymentDate).getTime() : 0;
      return bDate - aDate;
    })
    .map((row, index) => ({ ...row, rowKey: `${row.unitId}-${index}` }));
});

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return t('common.notSet');
  return n(value, 'currency');
}

function formatDate(value: string | null | undefined): string {
  if (!value) return t('common.notSet');
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return d(parsedDate, 'shortFormat');
}

function navigateToUnit(row: RentRow) {
  const view = toRentableUnitView(row.unitType);
  router.push({
    name: view,
    params: { projectId: props.projectId, unitId: row.unitId },
  } as Parameters<typeof router.push>[0]);
}

function showSuccessToast() {
  toast.add({
    severity: 'success',
    summary: t('rentalAgreement.unitsCard.success'),
    detail: t('rentalAgreement.unitsCard.successDetail'),
    life: 3000,
  });
}

function showErrorToast(error: unknown) {
  console.error('Failed to save units:', error instanceof Error ? error.message : error);
  toast.add({
    severity: 'error',
    summary: t('error.general'),
    detail: t('rentalAgreement.unitsCard.error'),
    life: 5000,
  });
}

const existingUnitIds = computed(() => new Set(rentRows.value.map((row) => row.unitId)));

const rentDialogVisible = ref(false);
// null => "add a new unit" mode (unit is chosen inside the dialog); set => "adjust rent" mode
// for that specific unit. RentRow structurally satisfies RentAdjustmentUnit, no mapping needed.
const rentDialogUnit = ref<RentAdjustmentUnit | null>(null);

function openAddDialog() {
  rentDialogUnit.value = null;
  rentDialogVisible.value = true;
}

function openAdjustRentDialog(row: RentRow) {
  rentDialogUnit.value = row;
  rentDialogVisible.value = true;
}

async function onRentDialogUpdated(updated: RentalAgreementJson) {
  emit('update:rentalAgreement', updated);
  await loadRentRows(updated);
}

const removeDialogVisible = ref(false);
const unitPendingRemoval = ref<UnitRef | null>(null);

function openRemoveDialog(row: RentRow) {
  unitPendingRemoval.value = {
    unitId: row.unitId, unitType: row.unitType, unitTitle: row.unitTitle 
  };
  removeDialogVisible.value = true;
}

async function confirmRemove() {
  const unit = unitPendingRemoval.value;
  if (!unit || !props.rentalAgreement.id) return;

  saving.value = true;
  try {
    await rentalAgreementService.removeRentalUnit(
      props.projectId,
      props.rentalAgreement.id,
      unit.unitType,
      unit.unitId,
    );
    const updated = await rentalAgreementService.getRentalAgreement(props.projectId, props.rentalAgreement.id);
    emit('update:rentalAgreement', updated);
    await loadRentRows(updated);
    showSuccessToast();
  } catch (error) {
    showErrorToast(error);
  } finally {
    saving.value = false;
    removeDialogVisible.value = false;
    unitPendingRemoval.value = null;
  }
}
</script>

<template>
  <BaseCard :loading="loading" :skeletonRows="4">
    <template #title>
      {{ t('rentalAgreement.unitsCard.title') }}
    </template>
    <template #content>
      <div v-if="rentRows.length === 0" class="text-muted-color text-sm">
        {{ t('rentalAgreement.unitsCard.empty') }}
      </div>
      <DataTable
        v-else
        :value="groupedRentRows"
        dataKey="rowKey"
        rowHover
        rowGroupMode="subheader"
        groupRowsBy="unitId"
        :pt="{ rowGroupHeaderCell: { colspan: 6 } }"
      >
        <Column field="firstPaymentDate" :header="t('rentalAgreement.common.paymentStart')">
          <template #body="{ data }">
            {{ formatDate(data.firstPaymentDate) }}
          </template>
        </Column>
        <Column field="lastPaymentDate" :header="t('rentalAgreement.common.paymentEnd')">
          <template #body="{ data }">
            {{ formatDate(data.lastPaymentDate) }}
          </template>
        </Column>
        <Column field="basicRent" :header="t('rentalAgreement.common.basicRent')">
          <template #body="{ data }">
            {{ formatCurrency(data.basicRent) }}
          </template>
        </Column>
        <Column
          field="operatingCostsPrepayment"
          :header="t('rentalAgreement.common.operatingCosts')"
          headerClass="hidden xl:table-cell"
          bodyClass="hidden xl:table-cell"
        >
          <template #body="{ data }">
            {{ formatCurrency(data.operatingCostsPrepayment) }}
          </template>
        </Column>
        <Column
          field="heatingCostsPrepayment"
          :header="t('rentalAgreement.common.heatingCosts')"
          headerClass="hidden xl:table-cell"
          bodyClass="hidden xl:table-cell"
        >
          <template #body="{ data }">
            {{ formatCurrency(data.heatingCostsPrepayment) }}
          </template>
        </Column>
        <Column
          field="billingCycle"
          :header="t('rentalAgreement.common.billingCycle')"
          headerClass="hidden 2xl:table-cell"
          bodyClass="hidden 2xl:table-cell"
        >
          <template #body="{ data }">
            {{ data.billingCycle ? t(`billingCycle.${data.billingCycle.toLowerCase()}`) : t('common.notSet') }}
          </template>
        </Column>

        <template #groupheader="{ data }">
          <div
            class="flex items-center justify-between w-full cursor-pointer"
            role="button"
            tabindex="0"
            @click="navigateToUnit(data)"
            @keydown.enter="navigateToUnit(data)"
          >
            <div class="font-semibold flex items-center gap-2">
              <span>{{ data.unitTitle }}</span>
              <span class="text-muted-color font-normal">({{ t(`unitTypes.${data.unitType.toLowerCase()}`) }})</span>
            </div>
            <div class="flex gap-2">
              <Button
                size="small"
                outlined
                icon="pi pi-pencil"
                :label="t('rentalAgreement.unitsCard.adjustRentButton')"
                :disabled="saving"
                :pt="{ label: { class: 'hidden sm:inline' } }"
                @click.stop="openAdjustRentDialog(data)"
              />
              <Button
                size="small"
                outlined
                severity="danger"
                icon="pi pi-trash"
                :label="t('rentalAgreement.unitsCard.deleteUnitButton')"
                :disabled="saving"
                :pt="{ label: { class: 'hidden sm:inline' } }"
                @click.stop="openRemoveDialog(data)"
              />
            </div>
          </div>
        </template>
      </DataTable>

      <div class="flex justify-end mt-6">
        <Button
          :label="t('rentalAgreement.unitsCard.addButton')"
          icon="pi pi-plus"
          :disabled="saving"
          @click="openAddDialog"
        />
      </div>
    </template>
  </BaseCard>

  <AdjustRentDialog
    v-model:visible="rentDialogVisible"
    :projectId="projectId"
    :agreementId="rentalAgreement.id"
    :unit="rentDialogUnit"
    :excludeUnitIds="[...existingUnitIds]"
    @update:rentalAgreement="onRentDialogUpdated"
  />

  <BaseDialog
    v-model:visible="removeDialogVisible"
    :closable="false"
    :header="t('projectTenancies.dialog.confirmationTitle')"
  >
    <p>{{ t('rentalAgreement.unitsCard.confirmRemove', { title: unitPendingRemoval?.unitTitle }) }}</p>
    <div class="flex justify-end gap-2 mt-6">
      <Button type="button" :label="t('button.cancel')" severity="secondary" @click="removeDialogVisible = false" />
      <Button
        type="button"
        :label="t('button.delete')"
        icon="pi pi-trash"
        severity="danger"
        :disabled="saving"
        @click="confirmRemove"
      />
    </div>
  </BaseDialog>
</template>
