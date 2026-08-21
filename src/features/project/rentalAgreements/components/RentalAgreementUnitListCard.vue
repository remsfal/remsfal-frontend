<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import type { TreeNode } from 'primevue/treenode';
import BaseCard from '@/components/common/BaseCard.vue';
import BaseDialog from '@/components/common/BaseDialog.vue';
import {rentalAgreementService,
  type RentalAgreementJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';
import {propertyService,
  toRentableUnitView,
  type UnitType,} from '@/features/project/rentableUnits/services/PropertyService';
import RentableUnitSelect from '@/features/project/rentableUnits/components/RentableUnitSelect.vue';
import { buildingService } from '@/features/project/rentableUnits/services/BuildingService';
import { apartmentService } from '@/features/project/rentableUnits/services/ApartmentService';
import { commercialService } from '@/features/project/rentableUnits/services/CommercialService';
import { storageService } from '@/features/project/rentableUnits/services/StorageService';
import { siteService } from '@/features/project/rentableUnits/services/SiteService';
import type { components } from '@/services/api/platform-schema';

type RentJson = components['schemas']['RentJson'];

interface DisplayUnit {
  id: string;
  title: string;
  type: UnitType;
}

const props = defineProps<{
  projectId: string;
  rentalAgreement: RentalAgreementJson;
}>();

const emit = defineEmits<{
  (e: 'update:rentalAgreement', agreement: RentalAgreementJson): void;
}>();

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const units = ref<DisplayUnit[]>([]);
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

function flattenRentEntries(agreement: RentalAgreementJson): Array<{ type: UnitType; unitId: string }> {
  return (Object.keys(RENT_FIELD_BY_TYPE) as UnitType[]).flatMap((type) => {
    const field = RENT_FIELD_BY_TYPE[type];
    const rents = (agreement[field] as RentJson[] | undefined) ?? [];
    return rents.map((rent) => ({ type, unitId: rent.rentalUnitId }));
  });
}

function toUpdatePayload(agreement: RentalAgreementJson): RentalAgreementJson {
  return {
    tenants: agreement.tenants?.map((tenant) => ({
      id: tenant.id,
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      email: tenant.email,
      mobilePhoneNumber: tenant.mobilePhoneNumber,
      businessPhoneNumber: tenant.businessPhoneNumber,
      privatePhoneNumber: tenant.privatePhoneNumber,
      address: tenant.address,
      placeOfBirth: tenant.placeOfBirth,
      dateOfBirth: tenant.dateOfBirth,
    })),
    startOfRental: agreement.startOfRental,
    endOfRental: agreement.endOfRental,
    basicRent: agreement.basicRent,
    operatingCostsPrepayment: agreement.operatingCostsPrepayment,
    heatingCostsPrepayment: agreement.heatingCostsPrepayment,
    keys: agreement.keys,
    propertyRents: agreement.propertyRents,
    siteRents: agreement.siteRents,
    buildingRents: agreement.buildingRents,
    apartmentRents: agreement.apartmentRents,
    storageRents: agreement.storageRents,
    commercialRents: agreement.commercialRents,
  };
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

async function loadUnits(agreement: RentalAgreementJson = props.rentalAgreement) {
  loading.value = true;
  try {
    const entries = flattenRentEntries(agreement);
    const results = await Promise.all(
      entries.map(async ({ type, unitId }) => {
        try {
          const detail = await fetchUnitDetail(unitId, type);
          return {
            id: unitId, title: detail.title ?? unitId, type 
          } satisfies DisplayUnit;
        } catch (error) {
          console.error(`Failed to load unit ${unitId} (${type}):`, error);
          return null;
        }
      }),
    );
    units.value = results.filter((unit): unit is DisplayUnit => unit !== null);
  } finally {
    loading.value = false;
  }
}

onMounted(() => loadUnits());

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

function onRowSelect(event: { data: DisplayUnit }) {
  const view = toRentableUnitView(event.data.type);
  router.push({
    name: view,
    params: { projectId: props.projectId, unitId: event.data.id },
  } as Parameters<typeof router.push>[0]);
}

const addDialogVisible = ref(false);
const selectedNodeKey = ref<string | null>(null);
const selectedNode = ref<TreeNode | null>(null);

const existingUnitIds = computed(() => new Set(units.value.map((unit) => unit.id)));

function openAddDialog() {
  selectedNodeKey.value = null;
  selectedNode.value = null;
  addDialogVisible.value = true;
}

function onNodeSelect(node: TreeNode) {
  selectedNode.value = node;
}

async function confirmAdd() {
  const node = selectedNode.value;
  if (!node?.data?.type || !props.rentalAgreement.id) return;

  const type = node.data.type as UnitType;
  const field = RENT_FIELD_BY_TYPE[type];
  const updated: RentalAgreementJson = {
    ...props.rentalAgreement,
    [field]: [...((props.rentalAgreement[field] as RentJson[] | undefined) ?? []), { rentalUnitId: node.key as string }],
  };

  saving.value = true;
  try {
    await rentalAgreementService.updateRentalAgreement(
      props.projectId,
      props.rentalAgreement.id,
      toUpdatePayload(updated),
    );
    emit('update:rentalAgreement', updated);
    await loadUnits(updated);
    showSuccessToast();
    addDialogVisible.value = false;
  } catch (error) {
    showErrorToast(error);
  } finally {
    saving.value = false;
  }
}

const removeDialogVisible = ref(false);
const unitPendingRemoval = ref<DisplayUnit | null>(null);

function openRemoveDialog(unit: DisplayUnit) {
  unitPendingRemoval.value = unit;
  removeDialogVisible.value = true;
}

async function confirmRemove() {
  const unit = unitPendingRemoval.value;
  if (!unit || !props.rentalAgreement.id) return;

  const field = RENT_FIELD_BY_TYPE[unit.type];
  const updated: RentalAgreementJson = {
    ...props.rentalAgreement,
    [field]: ((props.rentalAgreement[field] as RentJson[] | undefined) ?? []).filter(
      (rent) => rent.rentalUnitId !== unit.id,
    ),
  };

  saving.value = true;
  try {
    await rentalAgreementService.updateRentalAgreement(
      props.projectId,
      props.rentalAgreement.id,
      toUpdatePayload(updated),
    );
    emit('update:rentalAgreement', updated);
    await loadUnits(updated);
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
  <BaseCard>
    <template #title>
      {{ t('rentalAgreement.unitsCard.title') }}
    </template>
    <template #content>
      <div v-if="!loading && units.length === 0" class="text-muted-color text-sm">
        {{ t('rentalAgreement.unitsCard.empty') }}
      </div>
      <DataTable
        v-else
        :value="units"
        dataKey="id"
        selectionMode="single"
        :metaKeySelection="false"
        @rowSelect="onRowSelect"
      >
        <Column field="title" :header="t('rentalAgreement.unitsCard.columnTitle')" sortable />
        <Column field="type" :header="t('rentalAgreement.unitsCard.columnType')" sortable>
          <template #body="{ data }">
            {{ t(`unitTypes.${data.type.toLowerCase()}`) }}
          </template>
        </Column>
        <Column field="id" :header="t('rentalAgreement.unitsCard.columnId')" />
        <Column bodyStyle="text-align: right">
          <template #body="{ data }">
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              :disabled="saving"
              :aria-label="t('button.delete')"
              @click.stop="openRemoveDialog(data)"
            />
          </template>
        </Column>
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

  <BaseDialog
    v-model:visible="addDialogVisible"
    :closable="false"
    :header="t('rentalAgreement.unitsCard.addButton')"
    dialogClass="w-full max-w-2xl"
  >
    <div class="flex flex-col gap-4">
      <label for="rentalAgreementUnitSelect" class="font-semibold">
        {{ t('rentalAgreement.step2.selectUnit') }}
      </label>
      <RentableUnitSelect
        v-model="selectedNodeKey"
        :projectId="projectId"
        :excludeUnitIds="[...existingUnitIds]"
        inputId="rentalAgreementUnitSelect"
        @nodeSelect="onNodeSelect"
      />
      <div class="flex justify-end gap-2">
        <Button type="button" :label="t('button.cancel')" severity="secondary" @click="addDialogVisible = false" />
        <Button
          type="button"
          :label="t('rentalAgreement.unitsCard.confirmAdd')"
          icon="pi pi-check"
          :disabled="!selectedNode || saving"
          @click="confirmAdd"
        />
      </div>
    </div>
  </BaseDialog>

  <BaseDialog
    v-model:visible="removeDialogVisible"
    :closable="false"
    :header="t('projectTenancies.dialog.confirmationTitle')"
  >
    <p>{{ t('rentalAgreement.unitsCard.confirmRemove', { title: unitPendingRemoval?.title }) }}</p>
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
