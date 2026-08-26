<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import Breadcrumb from 'primevue/breadcrumb';
import type { MenuItem } from 'primevue/menuitem';
import BaseCard from '@/components/common/BaseCard.vue';
import {toRentableUnitView, EntityType,
  type RentalUnitTreeNodeJson, type RentalUnitNodeDataJson,} from '@/features/project/rentableUnits/services/PropertyService';
import { getIconForUnitType } from '../unitTypeIcons';
import { useRentableUnitsStore } from '@/features/project/rentableUnits/stores/RentableUnitsStore';

const props = defineProps<{
  projectId: string;
  unitId?: string;
}>();

const router = useRouter();
const { t } = useI18n();
const rentableUnitsStore = useRentableUnitsStore();
const { rentableUnitTree } = storeToRefs(rentableUnitsStore);

function findPath(
  nodes: RentalUnitTreeNodeJson[],
  target: string,
  currentPath: RentalUnitTreeNodeJson[],
): RentalUnitTreeNodeJson[] | null {
  for (const node of nodes) {
    if (node.key === target) return [...currentPath, node];
    if (node.children?.length) {
      const found = findPath(node.children, target, [...currentPath, node]);
      if (found) return found;
    }
  }
  return null;
}

const pathNodes = computed<RentalUnitNodeDataJson[]>(() => {
  if (!props.unitId) return [];
  const resultNodes = findPath(rentableUnitTree.value, props.unitId, []) ?? [];
  return resultNodes.map((node) => ({
    ...node.data,
    title: node.data?.title || 'Unbenannt',
    id: node.key,
    type: node.data?.type ?? EntityType.Property,
  }));
});

function mapNodesToItems(nodes: RentalUnitNodeDataJson[]): MenuItem[] {
  return nodes.map((node) => ({
    label: node.title,
    id: node.id,
    icon: getIconForUnitType(node.type),
    command: () => {
      router.push({
        name: toRentableUnitView(node.type),
        params: { projectId: props.projectId, unitId: node.id },
      } as Parameters<typeof router.push>[0]);
    },
  }));
}

const items = computed<MenuItem[]>(() => {
  const resultItems = mapNodesToItems(pathNodes.value);

  const lastItem = resultItems.at(-1);
  if (lastItem && lastItem.id === props.unitId) {
    lastItem.command = ({ originalEvent }) => originalEvent.preventDefault();
  }

  resultItems.unshift({
    label: t('breadcrumb.overview'),
    icon: 'pi pi-th-large',
    command: () => router.push({
      name: 'RentableUnits',
      params: { projectId: props.projectId },
    }),
  });

  return resultItems;
});
</script>

<template>
  <BaseCard>
    <template #content>
      <Breadcrumb
        :model="items"
        :pt="{
          root: { style: 'padding: 0' },
          itemLink: { class: 'flex items-baseline' },
        }"
      />
    </template>
  </BaseCard>
</template>

<style scoped>
:deep(.p-breadcrumb .p-breadcrumb-item-link) {
  align-items: baseline !important;
}
</style>
