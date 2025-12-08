<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { propertyService, type RentableUnitTreeNode } from '@/services/PropertyService';
import { apartmentService } from '@/services/ApartmentService';
import { buildingService } from '@/services/BuildingService';
import { commercialService } from '@/services/CommercialService';
import { siteService } from '@/services/SiteService';
import { storageService } from '@/services/StorageService';
import type { TreeTableExpandedKeys } from 'primevue/treetable';
import { useToast } from 'primevue/usetoast';
import RentableUnitsTable from '@/components/RentableUnitsTable.vue';

const props = defineProps<{ projectId: string }>();
const toast = useToast();

// --- Refs ---
const rentableUnitTree = ref<RentableUnitTreeNode[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const expandedKeys = ref<TreeTableExpandedKeys>({});

// --- Functions ---
async function fetchPropertyTree(projectId: string) {
  try {
    const data = await propertyService.getPropertyTree(projectId);
    rentableUnitTree.value = data.properties as RentableUnitTreeNode[];
    return data.properties as RentableUnitTreeNode[];
  } catch (err: any) {
    error.value = `Failed to fetch object data: ${err.message || 'Unknown error'}`;
    return [];
  }
}

function expandAll() {
  const expandRecursive = (nodes: RentableUnitTreeNode[], expanded: Record<string, boolean>) => {
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
  fetchPropertyTree(props.projectId).finally(() => {
    isLoading.value = false;
    expandAll();
  });
  toast.add({
    severity: 'success',
    summary: 'Neue Einheit hinzugefügt',
    detail: `Eine neue Einheit mit dem Titel ${title} wurde erfolgreich hinzugefügt`,
    life: 3000,
  });
}

function onDeleteNode(node: RentableUnitTreeNode) {
  if (!node.data) return;

  isLoading.value = true;
  const entity = node.data.type;
  switch (entity) {
    case 'PROPERTY':
      propertyService
        .deleteProperty(props.projectId, node.key)
        .then(() => fetchPropertyTree(props.projectId).finally(() => (isLoading.value = false)))
        .catch((err) => console.error('Error deleting property:', err));
      break;
    case 'SITE':
      siteService
        .deleteSite(props.projectId, node.key)
        .then(() => fetchPropertyTree(props.projectId).finally(() => (isLoading.value = false)))
        .catch((err) => console.error('Error deleting site:', err));
      break;
    case 'BUILDING':
      buildingService
        .deleteBuilding(props.projectId, node.key)
        .then(() => fetchPropertyTree(props.projectId).finally(() => (isLoading.value = false)))
        .catch((err) => console.error('Error deleting building:', err));
      break;
    case 'APARTMENT':
      apartmentService
        .deleteApartment(props.projectId, node.key)
        .then(() => fetchPropertyTree(props.projectId).finally(() => (isLoading.value = false)))
        .catch((err) => console.error('Error deleting apartment:', err));
      break;
    case 'COMMERCIAL':
      commercialService
        .deleteCommercial(props.projectId, node.key)
        .then(() => fetchPropertyTree(props.projectId).finally(() => (isLoading.value = false)))
        .catch((err) => console.error('Error deleting commercial:', err));
      break;
    case 'STORAGE':
      storageService
        .deleteStorage(props.projectId, node.key)
        .then(() => fetchPropertyTree(props.projectId).finally(() => (isLoading.value = false)))
        .catch((err) => console.error('Error deleting storage:', err));
      break;
  }
}

// --- Lifecycle ---
onMounted(() =>
  fetchPropertyTree(props.projectId).finally(() => {
    isLoading.value = false;
    expandAll();
  }),
);

// --- Expose refs & methods for tests ---
defineExpose({
  onDeleteNode,
  expandedKeys,
});
</script>

<template>
  <div v-if="error" class="alert alert-error">
    {{ error }}
  </div>
  <RentableUnitsTable
    v-if="!error"
    :projectId="props.projectId"
    :rentableUnitTree="rentableUnitTree"
    :isLoading="isLoading"
    :expandedKeys="expandedKeys"
    @update:expandedKeys="expandedKeys = $event"
    @expandAll="expandAll"
    @collapseAll="collapseAll"
    @newUnit="onNewRentableUnit"
    @deleteNode="onDeleteNode"
  />
</template>
