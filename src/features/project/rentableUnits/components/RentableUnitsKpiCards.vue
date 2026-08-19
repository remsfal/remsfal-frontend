<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import KpiCard from '@/components/common/KpiCard.vue';
import {propertyService,
  type RentalUnitTreeNodeJson,
  type UnitType,} from '@/features/project/rentableUnits/services/PropertyService';
import { getIconForUnitType, UNIT_TYPE_ICONS } from '../unitTypeIcons';

const props = defineProps<{ projectId: string }>();
const emit = defineEmits<{ (e: 'update:rentableUnitTree', tree: RentalUnitTreeNodeJson[]): void }>();
const { t } = useI18n();
const toast = useToast();

const rentableUnitTree = ref<RentalUnitTreeNodeJson[]>([]);
const isLoading = ref(true);

type UnitTypeAgg = { count: number; space: number };

function aggregate(nodes: RentalUnitTreeNodeJson[], acc: Record<UnitType, UnitTypeAgg>) {
  nodes.forEach((node) => {
    const type = node.data?.type;
    if (type) {
      acc[type].count += 1;
      acc[type].space += node.data?.space ?? 0;
    }
    if (node.children?.length) aggregate(node.children, acc);
  });
}

const unitAggregates = computed(() => {
  const acc = (Object.keys(UNIT_TYPE_ICONS) as UnitType[]).reduce(
    (result, type) => ({...result, [type]: {count: 0, space: 0}}),
    {} as Record<UnitType, UnitTypeAgg>,
  );
  aggregate(rentableUnitTree.value, acc);
  return acc;
});

const kpis = computed(() =>
  (Object.keys(UNIT_TYPE_ICONS) as UnitType[])
    .map((type) => ({ type, ...unitAggregates.value[type] }))
    .filter((kpi) => kpi.count > 0),
);

async function fetchPropertyTree(projectId: string) {
  try {
    const data = await propertyService.getPropertyTree(projectId);
    rentableUnitTree.value = data.properties as RentalUnitTreeNodeJson[];
    isLoading.value = false;
    emit('update:rentableUnitTree', rentableUnitTree.value);
  } catch {
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('rentableUnits.loadError'),
      life: 6000,
    });
  }
}

onMounted(() => fetchPropertyTree(props.projectId));
</script>

<template>
  <div v-if="isLoading" class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <Skeleton v-for="i in 6" :key="i" height="6rem" borderRadius="0.75rem" />
  </div>
  <Message v-else-if="kpis.length === 0" severity="success" closable class="mb-6">
    <template #icon>
      <i class="pi pi-sparkles text-xl" />
    </template>
    <span>
      {{ t('rentableUnits.kpi.emptyState.text') }}
      <br>
      <RouterLink
        :to="{ name: 'RentableUnits', params: { projectId } }"
        class="font-semibold underline"
      >
        {{ t('rentableUnits.kpi.emptyState.link') }}
      </RouterLink>
    </span>
  </Message>
  <div v-else class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <KpiCard
      v-for="kpi in kpis"
      :key="kpi.type"
      :icon="getIconForUnitType(kpi.type)"
      :title="t(`unitTypes.${kpi.type.toLowerCase()}`)"
      :value="kpi.count"
      :subtext="`${kpi.space} m²`"
    />
  </div>
</template>
