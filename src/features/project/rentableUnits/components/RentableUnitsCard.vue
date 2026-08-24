<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { type RentalUnitTreeNodeJson } from '@/features/project/rentableUnits/services/PropertyService';
import type { TreeTableExpandedKeys } from 'primevue/treetable';
import { useToast } from 'primevue/usetoast';
import BaseCard from '@/components/common/BaseCard.vue';
import RentableUnitsTable from './RentableUnitsTable.vue';
import { useRentableUnitsStore } from '@/features/project/rentableUnits/stores/RentableUnitsStore';

const props = defineProps<{ projectId: string }>();
const { t } = useI18n();
const toast = useToast();
const rentableUnitsStore = useRentableUnitsStore();
const { rentableUnitTree, isLoading } = storeToRefs(rentableUnitsStore);

// --- Refs ---
const expandedKeys = ref<TreeTableExpandedKeys>({});

// --- Functions ---
function expandAll() {
  const expandRecursive = (nodes: RentalUnitTreeNodeJson[], expanded: Record<string, boolean>) => {
    nodes.forEach((node) => {
      expanded[node.key] = true;
      if (node.children?.length) expandRecursive(node.children, expanded);
    });
  };
  const newExpandedRows: Record<string, boolean> = {};
  if (rentableUnitTree.value) expandRecursive(rentableUnitTree.value, newExpandedRows);
  expandedKeys.value = newExpandedRows;
}

function collapseAll() {
  expandedKeys.value = {};
}

watch(rentableUnitTree, () => expandAll(), { immediate: true });

function onNewRentableUnit(title: string) {
  rentableUnitsStore.invalidate();
  toast.add({
    severity: 'success',
    summary: 'Neue Einheit hinzugefügt',
    detail: `Eine neue Einheit mit dem Titel ${title} wurde erfolgreich hinzugefügt`,
    life: 3000,
  });
}

// --- Expose for tests ---
defineExpose({expandedKeys,});
</script>

<template>
  <BaseCard :loading="isLoading" :skeletonRows="6">
    <template #title>
      {{ t('rentableUnits.view.title') }}
    </template>

    <template #content>
      <RentableUnitsTable
        :projectId="props.projectId"
        :rentableUnitTree="rentableUnitTree"
        :expandedKeys="expandedKeys"
        @update:expandedKeys="expandedKeys = $event"
        @expandAll="expandAll"
        @collapseAll="collapseAll"
        @newUnit="onNewRentableUnit"
      />
    </template>
  </BaseCard>
</template>
