<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Message from 'primevue/message';
import KpiCard from '@/components/KpiCard.vue';
import { type RentalUnitTreeNodeJson, type UnitType } from '@/features/project/rentableUnits/services/PropertyService';
import { getIconForUnitType, UNIT_TYPE_ICONS } from '../unitTypeIcons';
import { useRentableUnitsStore } from '@/features/project/rentableUnits/stores/RentableUnitsStore';

defineProps<{ projectId: string }>();
const emit = defineEmits<{
  (e: 'update:rentableUnitTree', tree: RentalUnitTreeNodeJson[]): void;
}>();
const { t } = useI18n();
const rentableUnitsStore = useRentableUnitsStore();
const { rentableUnitTree, isLoading } = storeToRefs(rentableUnitsStore);

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
    (result, type) => ({ ...result, [type]: { count: 0, space: 0 } }),
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

watch(rentableUnitTree, (tree) => emit('update:rentableUnitTree', tree), { immediate: true });
</script>

<template>
  <Message v-if="!isLoading && kpis.length === 0" severity="success" closable class="mb-6">
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
    <template v-if="isLoading">
      <KpiCard v-for="i in 6" :key="i" loading />
    </template>
    <template v-else>
      <KpiCard
        v-for="kpi in kpis"
        :key="kpi.type"
        :icon="getIconForUnitType(kpi.type)"
        :title="t(`unitTypes.${kpi.type.toLowerCase()}`)"
        :value="kpi.count"
        :subtext="`${kpi.space} m²`"
      />
    </template>
  </div>
</template>
