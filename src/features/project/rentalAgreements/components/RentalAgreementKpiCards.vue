<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import KpiCard from '@/components/common/KpiCard.vue';
import { getIconForUnitType, type UnitType } from '@/features/project/rentableUnits';
import {rentalAgreementService,
  type RentalAgreementItemJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';
import {tenantService,
  type TenantItemJson,} from '@/features/project/rentalAgreements/services/TenantService';

const props = withDefaults(
  defineProps<{ projectId: string; unitIdsByType?: Partial<Record<UnitType, string[]>> }>(),
  { unitIdsByType: () => ({}) },
);
const { t, n } = useI18n();
const toast = useToast();

const agreements = ref<RentalAgreementItemJson[]>([]);
const tenants = ref<TenantItemJson[]>([]);
const isLoading = ref(true);

const today = new Date();
today.setHours(0, 0, 0, 0);

const hasData = computed(() => agreements.value.length > 0);

const currentAgreements = computed(() =>
  agreements.value.filter((agreement) => !agreement.endOfRental || new Date(agreement.endOfRental) >= today),
);

const totalBasicRent = computed(() =>
  currentAgreements.value.reduce((sum, agreement) => sum + (agreement.basicRent ?? 0), 0),
);

const totalHeatingCosts = computed(() =>
  currentAgreements.value.reduce((sum, agreement) => sum + (agreement.heatingCostsPrepayment ?? 0), 0),
);

const totalOperatingCosts = computed(() =>
  currentAgreements.value.reduce((sum, agreement) => sum + (agreement.operatingCostsPrepayment ?? 0), 0),
);

const tenantCount = computed(() => tenants.value.filter((tenant) => tenant.active).length);

const rentedUnitIds = computed(() => {
  const ids = new Set<string>();
  currentAgreements.value.forEach((agreement) => {
    agreement.rentalUnits?.forEach((unit) => {
      if (unit.id) ids.add(unit.id);
    });
  });
  return ids;
});

function countVacant(unitIds: string[]): number {
  return unitIds.filter((id) => !rentedUnitIds.value.has(id)).length;
}

const vacancyByType = computed(() =>
  Object.entries(props.unitIdsByType)
    .filter(([, ids]) => ids.length > 0)
    .map(([type, ids]) => ({ type: type as UnitType, count: countVacant(ids) })),
);

async function fetchData(projectId: string) {
  try {
    const [agreementList, tenantList] = await Promise.all([
      rentalAgreementService.getRentalAgreements(projectId),
      tenantService.fetchTenants(projectId),
    ]);
    agreements.value = agreementList;
    tenants.value = tenantList;
    isLoading.value = false;
  } catch {
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('rentalAgreement.kpi.loadError'),
      life: 6000,
    });
  }
}

onMounted(() => fetchData(props.projectId));
</script>

<template>
  <div v-if="isLoading" class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <Skeleton v-for="i in 6" :key="i" height="6rem" borderRadius="0.75rem" />
  </div>
  <Message v-else-if="!hasData" severity="success" closable class="mb-6">
    <template #icon>
      <i class="pi pi-sparkles text-xl" />
    </template>
    <span>
      {{ t('rentalAgreement.kpi.emptyState.text') }}
      <br>
      <RouterLink
        :to="{ name: 'RentalAgreementView', params: { projectId } }"
        class="font-semibold underline"
      >
        {{ t('rentalAgreement.kpi.emptyState.link') }}
      </RouterLink>
    </span>
  </Message>
  <div v-else class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <KpiCard
      icon="pi pi-euro"
      :title="t('rentalAgreement.kpi.totalRent')"
      :value="n(totalBasicRent, 'currency')"
    />
    <KpiCard
      icon="pi pi-bolt"
      :title="t('rentalAgreement.kpi.totalHeatingCosts')"
      :value="n(totalHeatingCosts, 'currency')"
    />
    <KpiCard
      icon="pi pi-wallet"
      :title="t('rentalAgreement.kpi.totalOperatingCosts')"
      :value="n(totalOperatingCosts, 'currency')"
    />
    <KpiCard
      icon="pi pi-users"
      :title="t('rentalAgreement.kpi.tenantCount')"
      :value="tenantCount"
    />
    <KpiCard
      v-for="vacancy in vacancyByType"
      :key="vacancy.type"
      :icon="getIconForUnitType(vacancy.type)"
      :title="t('rentalAgreement.kpi.vacancyByType', { type: t(`unitTypes.${vacancy.type.toLowerCase()}`) })"
      :value="vacancy.count"
      :iconBackground="vacancy.count > 0 ? 'var(--color-orange-600)' : undefined"
    />
  </div>
</template>
