<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import KpiCard from '@/components/common/KpiCard.vue';
import {getIconForUnitType, UNIT_TYPE_ICONS,
  type RentalUnitTreeNodeJson, type UnitType,} from '@/features/project/rentableUnits';
import {rentalAgreementService,
  type RentalAgreementItemJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';
import {tenantService,
  type TenantItemJson,} from '@/features/project/rentalAgreements/services/TenantService';

const props = withDefaults(
  defineProps<{ projectId: string; rentableUnitTree?: RentalUnitTreeNodeJson[] }>(),
  { rentableUnitTree: () => [] },
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

type VacancyAgg = { total: number; vacant: number };

// Returns true if this node's subtree contains at least one currently-rented unit —
// either because the node itself is directly rented (its own id is referenced by a
// current agreement, e.g. a fully rented building) or because one of its descendants is.
function collectVacancy(
  node: RentalUnitTreeNodeJson,
  rentedIds: Set<string>,
  acc: Record<UnitType, VacancyAgg>,
): boolean {
  const type = node.data?.type;
  const children = node.children ?? [];

  const anyChildRented = children.map((child) => collectVacancy(child, rentedIds, acc)).some(Boolean);
  const selfRented = !!node.data?.id && rentedIds.has(node.data.id);
  const subtreeRented = anyChildRented || selfRented;

  if (type) {
    acc[type].total += 1;
    if (!subtreeRented) acc[type].vacant += 1;
  }
  return subtreeRented;
}

const vacancyAgg = computed(() => {
  const acc = (Object.keys(UNIT_TYPE_ICONS) as UnitType[]).reduce(
    (result, type) => ({ ...result, [type]: { total: 0, vacant: 0 } }),
    {} as Record<UnitType, VacancyAgg>,
  );
  props.rentableUnitTree.forEach((node) => collectVacancy(node, rentedUnitIds.value, acc));
  return acc;
});

const vacancyByType = computed(() =>
  (Object.keys(UNIT_TYPE_ICONS) as UnitType[])
    .filter((type) => vacancyAgg.value[type].total > 0)
    .map((type) => ({ type, count: vacancyAgg.value[type].vacant })),
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
