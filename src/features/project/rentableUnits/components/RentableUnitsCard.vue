<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { propertyService, type RentalUnitTreeNodeJson } from '@/services/PropertyService.ts';
import { apartmentService } from '@/services/ApartmentService.ts';
import { buildingService } from '@/services/BuildingService.ts';
import { commercialService } from '@/services/CommercialService.ts';
import { siteService } from '@/services/SiteService.ts';
import { storageService } from '@/services/StorageService.ts';
import type { TreeTableExpandedKeys } from 'primevue/treetable';
import { useToast } from 'primevue/usetoast';
import Skeleton from 'primevue/skeleton';
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
    isLoading.value = false;
    expandAll();
  } catch {
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('rentableUnits.loadError'),
      life: 6000,
    });
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

function onDeleteNode(node: RentalUnitTreeNodeJson) {
  if (!node.data) return;
  isLoading.value = true;
  const entity = node.data.type;
  switch (entity) {
    case 'PROPERTY':
      propertyService
        .deleteProperty(props.projectId, node.key)
        .then(() => fetchPropertyTree(props.projectId))
        .catch((err) => console.error('Error deleting property:', err));
      break;
    case 'SITE':
      siteService
        .deleteSite(props.projectId, node.key)
        .then(() => fetchPropertyTree(props.projectId))
        .catch((err) => console.error('Error deleting site:', err));
      break;
    case 'BUILDING':
      buildingService
        .deleteBuilding(props.projectId, node.key)
        .then(() => fetchPropertyTree(props.projectId))
        .catch((err) => console.error('Error deleting building:', err));
      break;
    case 'APARTMENT':
      apartmentService
        .deleteApartment(props.projectId, node.key)
        .then(() => fetchPropertyTree(props.projectId))
        .catch((err) => console.error('Error deleting apartment:', err));
      break;
    case 'COMMERCIAL':
      commercialService
        .deleteCommercial(props.projectId, node.key)
        .then(() => fetchPropertyTree(props.projectId))
        .catch((err) => console.error('Error deleting commercial:', err));
      break;
    case 'STORAGE':
      storageService
        .deleteStorage(props.projectId, node.key)
        .then(() => fetchPropertyTree(props.projectId))
        .catch((err) => console.error('Error deleting storage:', err));
      break;
  }
}

// --- Lifecycle ---
onMounted(() => fetchPropertyTree(props.projectId));

// --- Expose for tests ---
defineExpose({
  onDeleteNode,
  expandedKeys,
});
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('rentableUnits.view.title') }}
    </template>

    <template #content>
      <template v-if="isLoading">
        <Skeleton v-for="i in 6" :key="i" height="2.5rem" class="mb-2" />
      </template>
      <RentableUnitsTable
        v-else
        :projectId="props.projectId"
        :rentableUnitTree="rentableUnitTree"
        :expandedKeys="expandedKeys"
        @update:expandedKeys="expandedKeys = $event"
        @expandAll="expandAll"
        @collapseAll="collapseAll"
        @newUnit="onNewRentableUnit"
        @deleteNode="onDeleteNode"
      />
    </template>
  </BaseCard>
</template>
