<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  propertyService,
  EntityType,
  type RentableUnitTreeNode,
  toRentableUnitView,
} from '@/services/PropertyService';
import { useRouter } from 'vue-router';
import Dialog from 'primevue/dialog'
import Button from 'primevue/button';
import Column from 'primevue/column';
import { apartmentService } from '@/services/ApartmentService';
import { buildingService } from '@/services/BuildingService';
import { garageService } from '@/services/GarageService';
import { commercialService } from '@/services/CommercialService';
import { siteService } from '@/services/SiteService';
import { useI18n } from 'vue-i18n';

import TreeTable, {
  type TreeTableExpandedKeys,
  type TreeTableSelectionKeys,
} from 'primevue/treetable';
import NewRentableUnitButton from '@/components/NewRentableUnitButton.vue';
import { useToast } from 'primevue/usetoast';
import NewPropertyButton from '@/components/NewPropertyButton.vue';

const props = defineProps<{
  projectId: string;
}>();
const { t } = useI18n();
const toast = useToast();

const rentableUnitTree = ref<RentableUnitTreeNode[]>();
const isLoading = ref(true);
const error = ref<string | null>(null);
const expandedKeys = ref<TreeTableExpandedKeys>({});
const selectedKey = ref<TreeTableSelectionKeys>({});
const showDeleteDialog = ref(false);
const nodeToDelete = ref<RentableUnitTreeNode | null>(null);


const router = useRouter();

async function fetchPropertyTree(projectId: string): Promise<RentableUnitTreeNode[]> {
  return propertyService
    .getPropertyTree(projectId)
    .then((data) => {
      rentableUnitTree.value = data.properties;
      return data.properties;
    })
    .catch((err) => {
      error.value = `Failed to fetch object data: ${err.message || 'Unknown error'}`;
      return [];
    });
}

onMounted(() => {
  fetchPropertyTree(props.projectId).finally(() => {
    isLoading.value = false;
  });
});

function onNewRentableUnit(title: string) {
  fetchPropertyTree(props.projectId).finally(() => {
    isLoading.value = false;
  });
  toast.add({
    severity: 'success',
    summary: 'Neue Einheit hinzugefügt',
    detail: `Eine neue Einheit mit dem Titel ${title} wurde erfolgreich hinzugefügt`,
    life: 3000,
  });
}

const expandAll = () => {
  const expandRecursive = (nodes: RentableUnitTreeNode[], expanded: Record<string, boolean>) => {
    nodes.forEach((node) => {
      expanded[node.key] = true;
      if (node.children && node.children.length > 0) {
        expandRecursive(node.children, expanded);
      }
    });
  };

  const newExpandedRows: Record<string, boolean> = {};
  if (rentableUnitTree.value) {
    expandRecursive(rentableUnitTree.value, newExpandedRows);
  }
  expandedKeys.value = newExpandedRows;
};

const collapseAll = () => {
  expandedKeys.value = {};
};

const onNodeSelect = (node: RentableUnitTreeNode) => {
  // For property type, navigate to detail view
  if (node.data.type === EntityType.Property) {
    router.push({
      name: 'PropertyDetailView',
      params: { projectId: props.projectId, unitId: node.key },
    });
  } else if (node.data.type === EntityType.Building) {
    // For building type, navigate to building view
    router.push({
      name: 'BuildingView',
      params: { projectId: props.projectId, buildingId: node.key },
    });
  } else if (node.data.type === EntityType.Apartment) {
    // For apartment type, navigate to apartment update view
    router.push({
      name: 'UpdateApartmentView',
      params: { 
        projectId: props.projectId, 
        apartmentId: node.key,
        // Since we don't have a way to determine the building ID, we'll use a placeholder
        // This will need to be updated when more information is available
        buildingId: '0'
      },
    });
  } else {
    // For other types, use the existing behavior
    const view = toRentableUnitView(node.data.type);
    router.push({
      name: view,
      params: { projectId: props.projectId, unitId: node.key },
    });
  }
  selectedKey.value.remove(node);
};

const onOpenInNewTab = (node: RentableUnitTreeNode) => {
  let routeName;
  let params: Record<string, string> = { projectId: props.projectId };

  // For property type, navigate to detail view
  if (node.data.type === EntityType.Property) {
    routeName = 'PropertyDetailView';
    params.unitId = node.key;
  } else if (node.data.type === EntityType.Building) {
    // For building type, navigate to building view
    routeName = 'BuildingView';
    params.buildingId = node.key;
  } else if (node.data.type === EntityType.Apartment) {
    // For apartment type, navigate to apartment update view
    routeName = 'UpdateApartmentView';
    params.apartmentId = node.key;
    params.buildingId = '0';
  } else {
    // For other types, use the existing behavior
    routeName = toRentableUnitView(node.data.type);
    params.unitId = node.key;
  }

  toast.add({
    severity: 'success',
    summary: 'Node Selected',
    detail: routeName,
    life: 3000,
  });

  const routeData = router.resolve({
    name: routeName,
    params: params,
  });
  window.open(routeData.href, '_blank');
};

const confirmDeleteNode = (node: RentableUnitTreeNode) => {
  nodeToDelete.value = node;
  showDeleteDialog.value = true;
};

const deleteConfirmed = () => {
  if (nodeToDelete.value) {
    onDeleteNode(nodeToDelete.value);
  }
  showDeleteDialog.value = false;
};

const onDeleteNode = (node: RentableUnitTreeNode) => {
  isLoading.value = true;
  const entity = node.data.type;

  const reload = () => fetchPropertyTree(props.projectId).finally(() => {
    isLoading.value = false;
  });

  const handleError = (e: unknown) => {
    console.error(`Fehler beim Löschen der Einheit vom Typ ${entity}:`, e);
  };

  switch (entity) {
    case EntityType.Property:
      propertyService.deleteProperty(props.projectId, node.key).then(reload).catch(handleError);
      break;
    case EntityType.Building:
      buildingService.deleteBuilding(props.projectId, node.key).then(reload).catch(handleError);
      break;
    case EntityType.Apartment:
      apartmentService.deleteApartment(props.projectId, node.key).then(reload).catch(handleError);
      break;
    case EntityType.Garage:
      garageService.deleteGarage(props.projectId, node.key).then(reload).catch(handleError);
      break;
    case EntityType.Commercial:
      commercialService.deleteCommercial(props.projectId, node.key).then(reload).catch(handleError);
      break;
    case EntityType.Site:
      siteService.deleteSite(props.projectId, node.key).then(reload).catch(handleError);
      break;
    default:
      console.warn(`Löschvorgang für Typ ${entity} nicht implementiert`);
      isLoading.value = false;
  }
};

</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <h1>{{ t('rentableUnits.view.title') }}</h1>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="!error" class="col-span-12">
        <div class="card">
          <TreeTable
            v-model:expandedKeys="expandedKeys"
            v-model:selectionKeys="selectedKey"
            :value="rentableUnitTree"
            selectionMode="single"
            :metaKeySelection="false"
            scrollable
            :loading="isLoading"
            @nodeSelect="onNodeSelect"
          >
            <template #header>
              <div class="flex justify-between flex-col sm:flex-row">
                <div>
                  <Button
                    icon="pi pi-plus"
                    :label="t('rentableUnits.button.expandAll')"
                    class="mr-2 mb-2"
                    @click="expandAll()"
                  />
                  <Button
                    icon="pi pi-minus"
                    :label="t('rentableUnits.button.collapseAll')"
                    class="mr-2 mb-2"
                    @click="collapseAll()"
                  />
                </div>
              </div>
            </template>
            <Column field="title" :header="t('rentableUnits.table.title')" expander>
              <template #body="{ node }">
                <div>{{ node.data.title }}</div>
              </template>
            </Column>

            <Column field="type" :header="t('rentableUnits.table.type')">
              <template #body="{ node }">
                <div>{{ t('rentableUnits.table.unitType.' + node.data.type) }}</div>
              </template>
            </Column>

            <Column field="description" :header="t('rentableUnits.table.description')">
              <template #body="{ node }">
                <div>{{ node.data.description }}</div>
              </template>
            </Column>

            <Column field="tenant" :header="t('rentableUnits.table.tenant')">
              <template #body="{ node }">
                <div>{{ node.data.tenant }}</div>
              </template>
            </Column>

            <Column field="usable_space" :header="t('rentableUnits.table.area')">
              <template #body="{ node }">
                <div>{{ node.data.usable_space }}</div>
              </template>
            </Column>

            <Column frozen alignFrozen="right">
              <template #body="{ node }">
                <div class="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    icon="pi pi-pencil"
                    severity="success"
                    @click="onOpenInNewTab(node)"
                  />
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    severity="danger"
                    data-testid="deleteNode"
                    @click="confirmDeleteNode(node)"
                  />
                  <NewRentableUnitButton
                    :projectId="props.projectId"
                    :parentId="node.key"
                    :type="node.data.type"
                    @newUnit="onNewRentableUnit"
                  />
                </div>
              </template>
            </Column>
          </TreeTable>
          <div class="flex justify-end basis-auto mt-6">
            <NewPropertyButton :projectId="props.projectId" @newUnit="onNewRentableUnit" />
          </div>
        </div>
      </div>
    </div>
    <Dialog v-model:visible="showDeleteDialog" header="Löschen bestätigen" modal data-testid="deleteDialog">
      <p>Bist du sicher, dass du dieses Objekt löschen möchtest?</p>
      <template #footer>
        <Button label="Abbrechen" icon="pi pi-times" @click="showDeleteDialog = false" data-testid="cancelDelete"/>
        <Button label="Löschen" icon="pi pi-check" severity="danger" @click="deleteConfirmed" data-testid="confirmDeleteButton"/>
      </template>
    </Dialog>
  </main>
</template>
