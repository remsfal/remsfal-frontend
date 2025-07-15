<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  propertyService,
  EntityType,
  type RentableUnitTreeNode,
  toRentableUnitView,
} from '@/services/PropertyService';
import { useRouter } from 'vue-router';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Column from 'primevue/column';
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
    expandAll();
  });
});

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
  const view = toRentableUnitView(node.data.type);
  router.push({
    name: view,
    params: { projectId: props.projectId, unitId: node.key },
  });
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

  if (entity === EntityType.Property) {
    propertyService
      .deleteProperty(props.projectId, node.key)
      .then(() => {
        fetchPropertyTree(props.projectId).finally(() => {
          isLoading.value = false;
        });
      })
      .catch((err) => {
        console.error('Error deleting property:', err);
      });
  }
  if (entity === EntityType.Site) {
    // TODO: implement delete site endpoint
  }
  if (entity === EntityType.Building) {
    // TODO: implement delete building endpoint
  }
  if (entity === EntityType.Apartment) {
    // TODO: implement delete apartment endpoint
  }
  if (entity === EntityType.Commercial) {
    // TODO: implement delete commercial endpoint
  }
  if (entity === EntityType.Storage) {
    // TODO: implement delete garage endpoint
  }
};
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12">
        <h1 class="w-full">{{ t('rentableUnits.view.title') }}</h1>
      </div>
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
                <div>{{ node.data.type }}</div>
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


            <Column frozen alignFrozen="right" bodyClass="flex flex-wrap justify-end">
              <template #body="{ node }">
                <div class="flex flex-wrap justify-end gap-2">
                  <NewRentableUnitButton
                    :projectId="props.projectId"
                    :parentId="node.key"
                    :type="node.data.type"
                    @newUnit="onNewRentableUnit"
                  />
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    severity="danger"
                    data-testid="deleteNode"
                    @click="confirmDeleteNode(node)"
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
