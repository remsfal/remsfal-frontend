<script setup lang="ts">
import Tag from 'primevue/tag';

import { formatTenancyLabel, type TenancyJson } from '@/services/TenancyService';
import { useI18n } from 'vue-i18n';

defineProps<{
  contract: TenancyJson;
}>();

const { t } = useI18n();

const getSeverity = (active: boolean | undefined) => {
  return active === false ? 'secondary' : 'success';
};

const formatCurrency = (value: number) =>
  value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

const formatDate = (value: string | undefined) => {
  if (!value) return null;
  return new Date(value).toLocaleDateString('de-DE');
};

const hasFinancials = (contract: TenancyJson) =>
  contract.basicRent != null ||
  contract.operatingCostsPrepayment != null ||
  contract.heatingCostsPrepayment != null;

const totalRent = (contract: TenancyJson) => {
  return (contract.basicRent ?? 0) +
    (contract.operatingCostsPrepayment ?? 0) +
    (contract.heatingCostsPrepayment ?? 0);
};

const formatUnitLabel = (unit: NonNullable<TenancyJson['rentalUnits']>[number]) => {
  const unitType = unit.type ? t(`unitTypes.${unit.type.toLowerCase()}`) : null;
  const unitDetails = [unit.title, unit.location]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .filter((part, index, parts) => parts.findIndex((value) => value.toLowerCase() === part.toLowerCase()) === index)
    .join(' ');
  return [unitType, unitDetails].filter(Boolean).join(' ') || t('tenantList.card.unknownUnit');
};
</script>

<template>
  <div
    data-testid="contract-card"
    class="flex min-h-72 flex-col gap-5 rounded-lg border border-gray-200 p-5 shadow-sm md:p-6"
  >
    <div class="flex items-start justify-between gap-2">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900">
          {{ formatTenancyLabel(contract) }}
        </h2>
        <div v-if="contract.rentalUnits?.length" class="flex flex-wrap gap-2 mt-2">
          <Tag
            v-for="(unit, index) in contract.rentalUnits"
            :key="unit.id || index"
            :value="formatUnitLabel(unit)"
            severity="secondary"
            rounded
          />
        </div>
      </div>
      <Tag
        :value="contract.active !== false
          ? t('tenantDashboard.status.active')
          : t('tenantDashboard.status.expired')"
        :severity="getSeverity(contract.active)"
        rounded
      />
    </div>

    <dl class="text-lg text-gray-600 space-y-1">
      <div v-if="contract.startOfRental" class="flex justify-between gap-2">
        <dt class="font-medium text-gray-500">
          {{ t('tenantDashboard.field.start') }}
        </dt>
        <dd class="text-gray-900">
          {{ formatDate(contract.startOfRental) }}
        </dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt class="font-medium text-gray-500">
          {{ t('tenantDashboard.field.end') }}
        </dt>
        <dd class="text-gray-900">
          {{ contract.endOfRental ? formatDate(contract.endOfRental) : t('tenantDashboard.field.ongoing') }}
        </dd>
      </div>
    </dl>

    <div v-if="hasFinancials(contract)" class="border-t border-gray-100 pt-3">
      <p class="text-lg font-semibold text-gray-700 mb-2">
        {{ t('tenantDashboard.section.financials') }}
      </p>
      <dl class="text-lg text-gray-600 space-y-1">
        <div v-if="contract.basicRent != null" class="flex justify-between">
          <dt class="text-gray-500">
            {{ t('tenantDashboard.field.basicRent') }}
          </dt>
          <dd class="text-gray-900">
            {{ formatCurrency(contract.basicRent) }}
          </dd>
        </div>
        <div v-if="contract.operatingCostsPrepayment != null" class="flex justify-between">
          <dt class="text-gray-500">
            {{ t('tenantDashboard.field.operatingCosts') }}
          </dt>
          <dd class="text-gray-900">
            {{ formatCurrency(contract.operatingCostsPrepayment) }}
          </dd>
        </div>
        <div v-if="contract.heatingCostsPrepayment != null" class="flex justify-between">
          <dt class="text-gray-500">
            {{ t('tenantDashboard.field.heatingCosts') }}
          </dt>
          <dd class="text-gray-900">
            {{ formatCurrency(contract.heatingCostsPrepayment) }}
          </dd>
        </div>
        <div class="flex justify-between border-t border-gray-200 pt-1 mt-1 font-semibold">
          <dt class="text-gray-700">
            {{ t('tenantDashboard.field.totalRent') }}
          </dt>
          <dd class="text-gray-900">
            {{ formatCurrency(totalRent(contract)) }}
          </dd>
        </div>
      </dl>
    </div>

    <div v-if="contract.tenants?.length" class="border-t border-gray-100 pt-3">
      <p class="text-lg font-semibold text-gray-700 mb-2">
        {{ t('tenantDashboard.section.coTenants') }}
      </p>
      <ul class="text-lg text-gray-600 space-y-1">
        <li v-for="tenant in contract.tenants" :key="tenant.id">
          {{ [tenant.firstName, tenant.lastName].filter(Boolean).join(' ') }}
        </li>
      </ul>
    </div>
  </div>
</template>
