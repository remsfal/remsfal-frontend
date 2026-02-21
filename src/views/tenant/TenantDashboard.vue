<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { tenancyService, formatTenancyLabel, type TenancyJson } from '@/services/TenancyService';
import BaseCard from '@/components/common/BaseCard.vue';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';

const { t } = useI18n();

const contracts = ref<TenancyJson[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const getSeverity = (active: boolean | undefined) => {
  return active !== false ? 'success' : 'secondary';
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

const loadContracts = async () => {
  loading.value = true;
  error.value = null;

  try {
    contracts.value = await tenancyService.getTenancies();
  } catch (err) {
    console.error(err);
    error.value = t('tenantDashboard.error');
    contracts.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(loadContracts);
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12">
        <h1 class="text-2xl font-semibold text-gray-900 mb-1">
          {{ t('tenantDashboard.title') }}
        </h1>
      </div>

      <div class="col-span-12">
        <BaseCard>
          <template #title>
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
              <div>
                <span class="text-xl font-semibold">{{ t('tenantDashboard.cardTitle') }}</span>
                <p class="text-base text-gray-500 font-normal mt-1">
                  {{ t('tenantDashboard.cardSubtitle') }}
                </p>
              </div>
              <div v-if="loading" class="flex items-center gap-2">
                <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="4" />
                <span class="text-sm text-gray-500">{{ t('tenantDashboard.loading') }}</span>
              </div>
            </div>
          </template>

          <template #content>
            <Message v-if="error" severity="error" class="mb-4" :closable="false">
              {{ error }}
            </Message>

            <div v-if="contracts.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mt-4">
              <div
                v-for="contract in contracts"
                :key="contract.agreementId"
                data-testid="contract-card"
                class="rounded-lg border border-gray-200 p-4 flex flex-col gap-4 shadow-sm"
              >
                <!-- Header: address / title + status badge -->
                <div class="flex items-start justify-between gap-2">
                  <h2 class="text-lg font-semibold text-gray-900">
                    {{ formatTenancyLabel(contract) }}
                  </h2>
                  <Tag
                    :value="contract.active !== false
                      ? t('tenantDashboard.status.active')
                      : t('tenantDashboard.status.expired')"
                    :severity="getSeverity(contract.active)"
                    rounded
                  />
                </div>

                <!-- Contract metadata -->
                <dl class="text-sm text-gray-600 space-y-1">
                  <div v-if="contract.agreementId" class="flex justify-between gap-2">
                    <dt class="font-medium text-gray-500">
                      {{ t('tenantDashboard.field.agreementId') }}
                    </dt>
                    <dd class="text-gray-900 truncate max-w-[60%] text-right">
                      {{ contract.agreementId }}
                    </dd>
                  </div>
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

                <!-- Financials section -->
                <div v-if="hasFinancials(contract)" class="border-t border-gray-100 pt-3">
                  <p class="text-sm font-semibold text-gray-700 mb-2">
                    {{ t('tenantDashboard.section.financials') }}
                  </p>
                  <dl class="text-sm text-gray-600 space-y-1">
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

                <!-- Rental units section -->
                <div v-if="contract.rentalUnits?.length" class="border-t border-gray-100 pt-3">
                  <p class="text-sm font-semibold text-gray-700 mb-2">
                    {{ t('tenantDashboard.section.rentalUnits') }}
                  </p>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li v-for="unit in contract.rentalUnits" :key="unit.id" class="flex flex-col">
                      <span class="text-gray-900">
                        {{ [unit.type, unit.title, unit.location].filter(Boolean).join(' – ') }}
                      </span>
                      <span v-if="unit.space != null" class="text-gray-500">
                        {{ unit.space.toLocaleString('de-DE') }} m²
                      </span>
                    </li>
                  </ul>
                </div>

                <!-- Co-tenants section -->
                <div v-if="contract.tenants?.length" class="border-t border-gray-100 pt-3">
                  <p class="text-sm font-semibold text-gray-700 mb-2">
                    {{ t('tenantDashboard.section.coTenants') }}
                  </p>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li v-for="tenant in contract.tenants" :key="tenant.id">
                      {{ [tenant.firstName, tenant.lastName].filter(Boolean).join(' ') }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div
              v-else-if="!loading"
              class="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-gray-500"
              data-testid="empty-state"
            >
              {{ t('tenantDashboard.empty') }}
            </div>
          </template>
        </BaseCard>
      </div>
    </div>
  </main>
</template>
