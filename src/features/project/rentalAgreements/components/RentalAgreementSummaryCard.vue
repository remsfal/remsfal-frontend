<script setup lang="ts">
import BaseCard from '@/components/common/BaseCard.vue';
import type { RentalAgreementJson } from '@/services/RentalAgreementService';
import type { components } from '@/services/api/platform-schema';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Popover from 'primevue/popover';

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
  rentalAgreement: RentalAgreementJson;
}>();

const emit = defineEmits<{
  delete: [];
}>();

const { t, d, n } = useI18n();
const deleteWarningMenu = ref<InstanceType<typeof Popover> | null>(null);

function mapRentsToSummary(rents: RentJson[] | undefined, unitType: UnitType): RentalUnitSummary[] {
  return (rents || []).map((rent) => {
    return {
      unitId: rent.unitId,
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

function toggleDeleteWarningMenu(event: Event): void {
  deleteWarningMenu.value?.toggle(event);
}

function confirmDelete(): void {
  deleteWarningMenu.value?.hide();
  emit('delete');
}

function closeDeleteWarningMenu(): void {
  deleteWarningMenu.value?.hide();
}

</script>

<template>
  <BaseCard>
    <template #title>
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <span class="text-xl font-semibold">{{ t('projectTenancies.table.title', { tenant: tenantTitleLabel }) }}</span>
          <p class="text-base text-gray-500 font-normal mt-1">
            {{ formatLabel('projectTenancies.table.mietvertragsNummer') }} {{ rentalAgreement.id || '—' }}
          </p>
        </div>
        <div class="flex items-end justify-end">
          <Button
            :label="t('projectTenancies.table.delete')"
            icon="pi pi-trash"
            severity="danger"
            @click="toggleDeleteWarningMenu"
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
      <Popover ref="deleteWarningMenu">
        <div class="flex max-w-80 flex-col gap-3">
          <p class="font-semibold text-red-600">
            {{ t('projectTenancies.dialog.confirmationTitle') }}
          </p>
          <p class="text-sm text-gray-700">
            {{ t('rentalAgreement.dialog.confirmDelete', { id: rentalAgreement.id }) }}
          </p>
          <div class="flex justify-end gap-2">
            <Button
              :label="t('button.cancel')"
              severity="secondary"
              text
              size="small"
              @click="closeDeleteWarningMenu"
            />
            <Button
              :label="t('button.delete')"
              icon="pi pi-trash"
              severity="danger"
              size="small"
              @click="confirmDelete"
            />
          </div>
        </div>
      </Popover>
    </template>
  </BaseCard>
</template>
