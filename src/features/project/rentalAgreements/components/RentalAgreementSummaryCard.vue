<script setup lang="ts">
import BaseCard from '@/components/common/BaseCard.vue';
import BaseDialog from '@/components/common/BaseDialog.vue';
import {rentalAgreementService,
  type RentalAgreementJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';
import type { components } from '@/services/api/platform-schema';
import { toISODateString } from '@/helper/dataHelper';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';

type RentJson = components['schemas']['RentJson'];
type UnitType = components['schemas']['UnitType'];
type RentalUnitSummary = {
  unitId: string;
  unitType: UnitType;
  title: string | null;
  location: string | null;
  basicRent?: number;
  operatingCostsPrepayment?: number;
  heatingCostsPrepayment?: number;
};

const props = defineProps<{
  projectId: string;
  rentalAgreement: RentalAgreementJson;
}>();

const emit = defineEmits<{
  (e: 'update:rentalAgreement', agreement: RentalAgreementJson): void;
}>();

const { t, d, n } = useI18n();
const toast = useToast();

const terminateDialogVisible = ref(false);
const endDateValue = ref<Date | null>(null);
const saving = ref(false);

function mapRentsToSummary(rents: RentJson[] | undefined, unitType: UnitType): RentalUnitSummary[] {
  return (rents || []).map((rent) => {
    return {
      unitId: rent.rentalUnitId,
      unitType,
      title: null,
      location: null,
      basicRent: rent.basicRent,
      operatingCostsPrepayment: rent.operatingCostsPrepayment,
      heatingCostsPrepayment: rent.heatingCostsPrepayment,
    };
  });
}

const rentalUnitSummary = computed<RentalUnitSummary[]>(() => [
  ...mapRentsToSummary(props.rentalAgreement.propertyRents, 'PROPERTY'),
  ...mapRentsToSummary(props.rentalAgreement.siteRents, 'SITE'),
  ...mapRentsToSummary(props.rentalAgreement.buildingRents, 'BUILDING'),
  ...mapRentsToSummary(props.rentalAgreement.apartmentRents, 'APARTMENT'),
  ...mapRentsToSummary(props.rentalAgreement.storageRents, 'STORAGE'),
  ...mapRentsToSummary(props.rentalAgreement.commercialRents, 'COMMERCIAL'),
]);

const totalBasicRent = computed(() => {
  return props.rentalAgreement.basicRent
    ?? rentalUnitSummary.value.reduce((sum, unit) => sum + (unit.basicRent || 0), 0);
});

const totalOperatingCosts = computed(() => {
  return props.rentalAgreement.operatingCostsPrepayment
    ?? rentalUnitSummary.value.reduce((sum, unit) => sum + (unit.operatingCostsPrepayment || 0), 0);
});

const totalHeatingCosts = computed(() => {
  return props.rentalAgreement.heatingCostsPrepayment
    ?? rentalUnitSummary.value.reduce((sum, unit) => sum + (unit.heatingCostsPrepayment || 0), 0);
});

const tenantCount = computed(() => props.rentalAgreement.tenants?.length ?? 0);

const tenantTitleLabel = computed(() => {
  const [firstTenant] = props.rentalAgreement.tenants || [];
  if (!firstTenant) {
    return t('common.notSet');
  } else if (props.rentalAgreement.tenants?.length === 2) {
    const firstTenantName = `${firstTenant.firstName || ''} ${firstTenant.lastName || ''}`.trim() || t('common.notSet');
    return `${firstTenantName} ${t('projectTenancies.table.more')}`;
  }

  const firstTenantName = `${firstTenant.firstName || ''} ${firstTenant.lastName || ''}`.trim() || t('common.notSet');

  if ((props.rentalAgreement.tenants?.length || 0) <= 1) {
    return firstTenantName;
  }

  const additionalTenants = props.rentalAgreement.tenants?.length ?? 0;
  const additionalCount = additionalTenants - 1

  return `${firstTenantName} ${t('projectTenancies.table.andMore', {count: additionalCount,})}`;
})

function formatDateLabel(date: string | null | undefined): string {
  if (!date) return t('common.notSet');
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return d(parsedDate, 'shortFormat');
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return t('common.notSet');
  return n(value, 'currency');
}

function formatLabel(key: string): string {
  return `${t(key)}:`;
}

const isEndDateValid = computed(() => {
  if (!endDateValue.value) return false;
  if (!props.rentalAgreement.startOfRental) return true;
  return endDateValue.value > new Date(props.rentalAgreement.startOfRental);
});

function openTerminateDialog(): void {
  endDateValue.value = props.rentalAgreement.endOfRental
    ? new Date(props.rentalAgreement.endOfRental)
    : null;
  terminateDialogVisible.value = true;
}

function closeTerminateDialog(): void {
  terminateDialogVisible.value = false;
}

async function confirmTerminate(): Promise<void> {
  if (!isEndDateValid.value || !props.rentalAgreement.id) return;

  const endOfRental = toISODateString(endDateValue.value);
  saving.value = true;
  try {
    await rentalAgreementService.updateRentalAgreement(props.projectId, props.rentalAgreement.id, {endOfRental,});
    emit('update:rentalAgreement', { ...props.rentalAgreement, endOfRental });
    toast.add({
      severity: 'success',
      summary: t('rentalAgreement.terminate.success'),
      detail: t('rentalAgreement.terminate.successDetail'),
      life: 3000,
    });
    terminateDialogVisible.value = false;
  } catch (error) {
    console.error('Failed to terminate rental agreement:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('rentalAgreement.terminate.error'),
      life: 5000,
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <BaseCard>
    <template #title>
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <span class="text-xl font-semibold">{{ t('projectTenancies.table.title', { tenant: tenantTitleLabel }) }}</span>
          <p class="text-base text-gray-500 font-normal mt-1">
            {{ formatLabel('projectTenancies.table.tenancyNumber') }} {{ rentalAgreement.id || '—' }}
          </p>
        </div>
        <div class="flex items-end justify-end">
          <Button
            :label="t('rentalAgreement.terminate.button')"
            icon="pi pi-times"
            severity="danger"
            @click="openTerminateDialog"
          />
        </div>
      </div>
    </template>
    <template #content>
      <div class="grid grid-cols-1 gap-4 lg:min-[1000px]:grid-cols-2 xl:grid-cols-3 ">
        <dl class="space-y-2 text-[14.5px] text-gray-600">
          <div class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ formatLabel('projectTenancies.table.rentalStart') }}
            </dt>
            <dd class="text-gray-900">
              {{ formatDateLabel(rentalAgreement.startOfRental) }}
            </dd>
          </div>
          <div class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ formatLabel('projectTenancies.table.rentalEnd') }}
            </dt>
            <dd class="text-gray-900">
              {{ formatDateLabel(rentalAgreement.endOfRental) }}
            </dd>
          </div>
          <div class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ formatLabel('projectTenancies.table.tenants') }}
            </dt>
            <dd class="text-gray-900">
              {{ tenantCount }}
            </dd>
          </div>
        </dl>
        <dl class="space-y-2 text-[14.5px] text-gray-600">
          <div class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ formatLabel('rentalAgreement.step2.basicRent') }}
            </dt>
            <dd class="text-gray-900">
              {{ formatCurrency(totalBasicRent) }}
            </dd>
          </div>
          <div class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ formatLabel('rentalAgreement.step2.operatingCosts') }}
            </dt>
            <dd class="text-gray-900">
              {{ formatCurrency(totalOperatingCosts) }}
            </dd>
          </div>
          <div class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ formatLabel('rentalAgreement.step2.heatingCosts') }}
            </dt>
            <dd class="text-gray-900">
              {{ formatCurrency(totalHeatingCosts) }}
            </dd>
          </div>
        </dl>
        <dl class="space-y-2 text-[14.5px] text-gray-600">
          <div class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ formatLabel('projectTenancies.table.amountKeys') }}
            </dt>
            <dd class="text-gray-900">
              Schema noch nicht Vollständig
            </dd>
          </div>
        </dl>
      </div>
    </template>
  </BaseCard>

  <BaseDialog
    v-model:visible="terminateDialogVisible"
    :closable="false"
    :header="t('rentalAgreement.terminate.dialogTitle')"
  >
    <div class="flex flex-col gap-2">
      <label for="terminateEndDate" class="font-semibold">
        {{ t('rentalAgreement.terminate.selectEndDate') }}
      </label>
      <DatePicker
        v-model="endDateValue"
        inputId="terminateEndDate"
        dateFormat="dd.mm.yy"
        showIcon
        fluid
      />
      <small v-if="endDateValue && !isEndDateValid" class="text-red-600">
        {{ t('rentalAgreement.terminate.invalidDate') }}
      </small>
    </div>
    <div class="flex justify-end gap-2 mt-6">
      <Button
        :label="t('button.cancel')"
        severity="secondary"
        text
        :disabled="saving"
        @click="closeTerminateDialog"
      />
      <Button
        :label="t('rentalAgreement.terminate.dialogTitle')"
        icon="pi pi-times"
        severity="danger"
        :disabled="!isEndDateValid || saving"
        @click="confirmTerminate"
      />
    </div>
  </BaseDialog>
</template>
