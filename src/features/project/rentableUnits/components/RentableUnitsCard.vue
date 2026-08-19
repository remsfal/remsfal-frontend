<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { propertyService, type RentalUnitTreeNodeJson } from '@/features/project/rentableUnits/services/PropertyService';
import type { TreeTableExpandedKeys } from 'primevue/treetable';
import { useToast } from 'primevue/usetoast';
import BaseCard from '@/components/common/BaseCard.vue';
import RentableUnitsTable from './RentableUnitsTable.vue';

const props = defineProps<{ projectId: string }>();
const { t } = useI18n();
const toast = useToast();

// --- Refs ---
const rentableUnitTree = ref<RentalUnitTreeNodeJson[]>([]);
const isLoading = ref(true);
const expandedKeys = ref<TreeTableExpandedKeys>({});

// --- Functions ---
async function fetchPropertyTree(projectId: string) {
  try {
    const data = await propertyService.getPropertyTree(projectId);
    rentableUnitTree.value = data.properties as RentalUnitTreeNodeJson[];
    expandAll();
  } catch {
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('rentableUnits.loadError'),
      life: 6000,
    });
  } finally {
    isLoading.value = false;
  }
}

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

function onNewRentableUnit(title: string) {
  isLoading.value = true;
  fetchPropertyTree(props.projectId);
  toast.add({
    severity: 'success',
    summary: 'Neue Einheit hinzugefügt',
    detail: `Eine neue Einheit mit dem Titel ${title} wurde erfolgreich hinzugefügt`,
    life: 3000,
  });
}

// --- Lifecycle ---
onMounted(() => fetchPropertyTree(props.projectId));

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
