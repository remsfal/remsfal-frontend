<script setup lang="ts">
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';

import BaseCard from '@/components/BaseCard.vue';
import { formatTenancyLabel, type TenancyJson } from '@/services/TenancyService';
import { useI18n } from 'vue-i18n';

defineProps<{
  contract: TenancyJson;
}>();

const { t } = useI18n();

const isActive = (contract: TenancyJson) => {
  if (!contract.endOfRental) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(contract.endOfRental) >= today;
};

const getSeverity = (contract: TenancyJson) => {
  return isActive(contract) ? 'success' : 'secondary';
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
  <div data-testid="contract-card" class="h-full">
    <BaseCard>
      <template #content>
        <div class="flex flex-col gap-5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h2 class="text-2xl font-semibold text-color">
                {{ formatTenancyLabel(contract) }}
              </h2>
              <div v-if="contract.rentalUnits?.length" class="mt-2 flex flex-wrap gap-2">
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
              :value="isActive(contract)
                ? t('tenantDashboard.status.active')
                : t('tenantDashboard.status.expired')"
              :severity="getSeverity(contract)"
              rounded
            />
          </div>

          <div class="flex flex-col gap-4 xl:flex-row lg:items-stretch">
            <div class="lg:flex-1">
              <p class="mb-2 text-lg font-semibold text-color">
                {{ t('tenantDashboard.section.allDates') }}
              </p>
              <dl class="space-y-1 text-lg text-muted-color">
                <div v-if="contract.startOfRental" class="flex justify-between gap-2">
                  <dt class="font-medium text-muted-color">
                    {{ t('tenantDashboard.field.start') }}
                  </dt>
                  <dd class="text-color">
                    {{ formatDate(contract.startOfRental) }}
                  </dd>
                </div>
                <div class="flex justify-between gap-2">
                  <dt class="font-medium text-muted-color">
                    {{ t('tenantDashboard.field.end') }}
                  </dt>
                  <dd class="text-color">
                    {{ contract.endOfRental ? formatDate(contract.endOfRental) : t('tenantDashboard.field.ongoing') }}
                  </dd>
                </div>
              </dl>
            </div>

            <template v-if="hasFinancials(contract)">
              <Divider layout="vertical" class="hidden lg:flex" />
              
              <div class="lg:flex-1">
                <p class="mb-2 text-lg font-semibold text-color">
                  {{ t('tenantDashboard.section.financials') }}
                </p>
                <dl class="space-y-1 text-lg text-muted-color">
                  <div v-if="contract.basicRent != null" class="flex justify-between">
                    <dt class="text-muted-color">
                      {{ t('tenantDashboard.field.basicRent') }}
                    </dt>
                    <dd class="text-color">
                      {{ formatCurrency(contract.basicRent) }}
                    </dd>
                  </div>
                  <div v-if="contract.operatingCostsPrepayment != null" class="flex justify-between">
                    <dt class="text-muted-color">
                      {{ t('tenantDashboard.field.operatingCosts') }}
                    </dt>
                    <dd class="text-color">
                      {{ formatCurrency(contract.operatingCostsPrepayment) }}
                    </dd>
                  </div>
                  <div v-if="contract.heatingCostsPrepayment != null" class="flex justify-between">
                    <dt class="text-muted-color">
                      {{ t('tenantDashboard.field.heatingCosts') }}
                    </dt>
                    <dd class="text-color">
                      {{ formatCurrency(contract.heatingCostsPrepayment) }}
                    </dd>
                  </div>
                  <div class="mt-1 flex justify-between border-t border-surface pt-1 font-semibold">
                    <dt class="text-color">
                      {{ t('tenantDashboard.field.totalRent') }}
                    </dt>
                    <dd class="text-color">
                      {{ formatCurrency(totalRent(contract)) }}
                    </dd>
                  </div>
                </dl>
              </div>
            </template>

            <template v-if="contract.tenants?.length">
              <Divider layout="vertical" class="hidden lg:flex" />

              <div class="lg:flex-1">
                <p class="mb-2 text-lg font-semibold text-color">
                  {{ t('tenantDashboard.section.coTenants') }}
                </p>
                <ul class="space-y-1 text-lg text-muted-color">
                  <li v-for="tenant in contract.tenants" :key="tenant.id">
                    {{ [tenant.firstName, tenant.lastName].filter(Boolean).join(' ') }}
                  </li>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </template>
    </BaseCard>
  </div>
</template>
