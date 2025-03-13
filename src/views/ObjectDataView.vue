<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { projectService, EntityType, type PropertyNode } from '@/services/ProjectService';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import SplitButton from 'primevue/splitbutton';
import TreeTable from 'primevue/treetable';

const props = defineProps<{
  projectId: string;
}>();

const objectData = ref<PropertyNode[]>();
const isLoading = ref(true);
const error = ref<string | null>(null);
const expandedKeys = ref({});

const router = useRouter();

function createButtonRow(key: string, type: EntityType): PropertyNode {
  return {
    key,
    data: {
      type,
      isButtonRow: true,
    },
    children: [],
  };
}

function injectButtonRows(nodes: PropertyNode[]): PropertyNode[] {
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

async function fetchPropertyTree(projectId: string): Promise<PropertyNode[]> {
  return projectService
    .getPropertyTree(projectId, 10, 0)
    .then((data) => {
      /* Every node exept Apartment, Commercial, Garge and Site nodes get an extra entry with
        the id and type of the parent as key and type with the isButtonRow attribute enabled. */
      const nodesWithButtons = [
        ...injectButtonRows(data.nodes),
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
    projectService.deleteProperty(props.projectId, entityId).catch((err) => {
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
  const expandRecursive = (nodes: PropertyNode[], expanded: Record<string, boolean>) => {
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
                <div v-if="node.data.isButtonRow && node.data.type === EntityType.Project">
                  <Button
                    type="button"
                    icon="pi pi-plus"
                    label="Grundstück erstellen "
                    severity="success"
                    @click="completeEntityAction(EntityType.Property, 'create', node.key)"
                  />
                </div>
                <div v-if="node.data.isButtonRow && node.data.type === EntityType.Property">
                  <SplitButton
                    label="Erstellen"
                    severity="success"
                    :model="[
                      {
                        label: 'Gebäude erstellen',
                        icon: 'pi pi-building',
                        command: () =>
                          completeEntityAction(EntityType.Building, 'create', node.key),
                      },
                      {
                        label: 'Außenanlage erstellen',
                        icon: 'pi pi-sun',
                        command: () => completeEntityAction(EntityType.Site, 'create', node.key),
                      },
                    ]"
                  />
                </div>
                <div v-if="node.data.isButtonRow && node.data.type === EntityType.Building">
                  <SplitButton
                    label="Erstellen"
                    severity="success"
                    :model="[
                      {
                        label: 'Wohnung erstellen',
                        icon: 'pi pi-building',
                        command: () =>
                          completeEntityAction(EntityType.Apartment, 'create', node.key),
                      },
                      {
                        label: 'Gewerbe erstellen',
                        icon: 'pi pi-briefcase',
                        command: () =>
                          completeEntityAction(EntityType.Commercial, 'create', node.key),
                      },
                      {
                        label: 'Nebennutzungsraum erstellen',
                        icon: 'pi pi-car',
                        command: () => completeEntityAction(EntityType.Garage, 'create', node.key),
                      },
                    ]"
                  />
                </div>
              </template>
            </Column>
          </TreeTable>
        </div>
      </div>
    </div>
  </main>
</template>
