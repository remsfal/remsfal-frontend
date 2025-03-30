<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { propertyService, EntityType, type RentableUnitTreeNode } from '@/services/PropertyService';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import TreeTable from 'primevue/treetable';
import NewRentableUnitButton from '@/components/NewRentableUnitButton.vue';
import { useToast } from 'primevue/usetoast';

const props = defineProps<{
  projectId: string;
}>();

const toast = useToast();

const objectData = ref<RentableUnitTreeNode[]>();
const isLoading = ref(true);
const error = ref<string | null>(null);
const expandedKeys = ref({});

const router = useRouter();

function createButtonRow(key: string, type: EntityType): RentableUnitTreeNode {
  return {
    key,
    data: {
      type,
      isButtonRow: true,
    },
    children: [],
  };
}

function injectButtonRows(nodes: RentableUnitTreeNode[]): RentableUnitTreeNode[] {
  return nodes.map((node) => {
    const { type } = node.data;

    if (
      type !== EntityType.Apartment &&
      type !== EntityType.Commercial &&
      type !== EntityType.Garage &&
      type !== EntityType.Site
    ) {
      const buttonRow = createButtonRow(node.key, type);

      node.children = injectButtonRows(node.children);
      node.children.push(buttonRow);
    }

    return node;
  });
}

async function fetchPropertyTree(projectId: string): Promise<RentableUnitTreeNode[]> {
  return propertyService
    .getPropertyTree(projectId)
    .then((data) => {
      /* Every node exept Apartment, Commercial, Garge and Site nodes get an extra entry with
        the id and type of the parent as key and type with the isButtonRow attribute enabled. */
      const nodesWithButtons = [
        ...injectButtonRows(data.properties),
        createButtonRow(projectId, EntityType.Project),
      ];

      objectData.value = nodesWithButtons;

      return nodesWithButtons;
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

const completeEntityAction = (entity: EntityType, action: string, entityId?: string) => {
  if (action === 'edit') {
    router.push({
      path: `/project/${props.projectId}/${entity}/${entityId}`,
    });
  }
  if (entityId && action === 'delete') {
    deleteObject(entity, entityId);
  }
  if (action === 'create') {
    router.push({
      path: `/project/${props.projectId}/${entity}/create`,
      query: { parentId: entityId }, // in this case entityId is the Id of the parent
    });
  }
};

const deleteObject = (entity: EntityType, entityId: string) => {
  if (entity === EntityType.Property) {
    propertyService.deleteProperty(props.projectId, entityId).catch((err) => {
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
  if (entity === EntityType.Garage) {
    // TODO: implement delete garage endpoint
  }
};

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
  if (objectData.value) {
    expandRecursive(objectData.value, newExpandedRows);
  }
  expandedKeys.value = newExpandedRows;
};

const collapseAll = () => {
  expandedKeys.value = {};
};
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <h1>Objektdaten Ansicht</h1>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="!error" class="col-span-12">
        <div class="card">
          <TreeTable
            v-model:expandedKeys="expandedKeys"
            :value="objectData"
            scrollable
            :loading="isLoading"
          >
            <template #header>
              <div class="flex justify-between flex-col sm:flex-row">
                <div>
                  <Button
                    icon="pi pi-plus"
                    label="Alle ausklappen"
                    class="mr-2 mb-2"
                    @click="expandAll()"
                  />
                  <Button
                    icon="pi pi-minus"
                    label="Alle einklappen"
                    class="mr-2 mb-2"
                    @click="collapseAll()"
                  />
                </div>
              </div>
            </template>
            <Column field="title" header="Title" expander>
              <template #body="{ node }">
                <div v-if="!node.data.isButtonRow">{{ node.data.title }}</div>
              </template>
            </Column>
            <Column field="type" header="Typ">
              <template #body="{ node }">
                <div v-if="!node.data.isButtonRow">{{ node.data.type }}</div>
              </template>
            </Column>
            <Column field="description" header="Beschreibung">
              <template #body="{ node }">
                <div v-if="!node.data.isButtonRow">{{ node.data.description }}</div>
              </template>
            </Column>
            <Column field="tenant" header="Mieter">
              <template #body="{ node }">
                <div v-if="!node.data.isButtonRow">{{ node.data.tenant }}</div>
              </template>
            </Column>
            <Column field="usable_space" header="Fläche">
              <template #body="{ node }">
                <div v-if="!node.data.isButtonRow">{{ node.data.usable_space }}</div>
              </template>
            </Column>
            <Column frozen alignFrozen="right">
              <template #body="{ node }">
                <div v-if="!node.data.isButtonRow" class="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    icon="pi pi-pencil"
                    severity="success"
                    @click="completeEntityAction(node.data.type, 'edit', node.key)"
                  />
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    severity="danger"
                    @click="completeEntityAction(node.data.type, 'delete', node.key)"
                  />
                </div>
                <NewRentableUnitButton
                  :projectId="props.projectId"
                  :parentId="node.key"
                  :type="node.data.type"
                  @newUnit="onNewRentableUnit"
                />
              </template>
            </Column>
          </TreeTable>
        </div>
      </div>
    </div>
  </main>
</template>
