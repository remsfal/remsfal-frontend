<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import Breadcrumb from 'primevue/breadcrumb';
import type { MenuItem } from 'primevue/menuitem';
import BaseCard from '@/components/common/BaseCard.vue';
import {propertyService, toRentableUnitView, EntityType,
  type RentalUnitTreeNodeJson, type RentalUnitNodeDataJson,} from '@/services/PropertyService';
import { getIconForUnitType } from '../unitTypeIcons';

const props = defineProps<{
  projectId: string;
  unitId?: string;
}>();

const router = useRouter();
const { t } = useI18n();
const items = ref<MenuItem[]>([]);

const fetchPathNodes = async (targetId: string | undefined): Promise<RentalUnitNodeDataJson[]> => {
  if (!targetId || !props.projectId) return [];
  try {
    const data = await propertyService.getPropertyTree(props.projectId);
    const tree = (data.properties ?? []) as RentalUnitTreeNodeJson[];

    const findPath = (
      nodes: RentalUnitTreeNodeJson[],
      target: string,
      currentPath: RentalUnitTreeNodeJson[],
    ): RentalUnitTreeNodeJson[] | null => {
      for (const node of nodes) {
        if (node.key === target) return [...currentPath, node];
        if (node.children?.length) {
          const found = findPath(node.children, target, [...currentPath, node]);
          if (found) return found;
        }
      }
      return null;
    };

    const resultNodes = findPath(tree, targetId, []) ?? [];
    return resultNodes.map((node) => ({
      ...node.data,
      title: node.data?.title || 'Unbenannt',
      id: node.key,
      type: node.data?.type ?? EntityType.Property,
    }));
  } catch {
    return [];
  }
};

const mapNodesToItems = (nodes: RentalUnitNodeDataJson[]): MenuItem[] => {
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
};

const loadBreadcrumbs = async () => {
  const pathNodes = await fetchPathNodes(props.unitId);
  const resultItems = mapNodesToItems(pathNodes);

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

  items.value = resultItems;
};

onMounted(() => { loadBreadcrumbs(); });
</script>

<template>
  <BaseCard>
    <template #content>
      <Breadcrumb :model="items" :pt="{ root: { style: 'padding: 0' } }" />
    </template>
  </BaseCard>
</template>
