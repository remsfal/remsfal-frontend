<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ProjectService, { type PropertyNode } from '@/services/ProjectService';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import TreeTable from 'primevue/treetable';

const props = defineProps<{
  projectId: string;
}>();

const projectService = new ProjectService();
const objectData = ref();
const isLoading = ref(true);
const error = ref<string | null>(null);
const expandedRows = ref<Record<string, boolean>>({});

const router = useRouter();

function fetchPropertyTree(projectId: string): Promise<PropertyNode[]> {
  return projectService
    .getPropertyTree(projectId, 10, 0)
    .then((data) => {
      objectData.value = data.nodes;
      return data.nodes;
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

const completeEntityAction = (entity: string, action: string, entityId?: string) => {
  if (action === 'edit') {
    router.push({
      path: `/project/${props.projectId}/${entity}/${entityId}`,
      query: { action: action, propertyId: entityId },
    });
  }
  if (entityId && action === 'delete') {
    deleteObject(entity, entityId);
  }
  if (action === 'create') {
    // open dialog
  }
};

const deleteObject = (entity: string, entityId: string) => {
  if (entity === 'property') {
    projectService.deleteProperty(props.projectId, entityId).catch((err) => {
      console.error('Error deleting property:', err);
    });
  }
  if (entity === 'building') {
    // TODO: implement delete building endpoint
  }
  if (entity === 'apartment') {
    // TODO: implement delete apartment endpoint
  }
  if (entity === 'garage') {
    // TODO: implement delete garage endpoint
  }
};
</script>

<template>
  <main>
    <div class="grid">
      <h1>Objektdaten Ansicht</h1>
      <div v-if="isLoading">Loading...</div>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="!isLoading && !error" class="col-12">
        <div class="card">
          <TreeTable v-model:expandedRows="expandedRows" :value="objectData" scrollable>
            <template #header>
              <div class="flex justify-content-between flex-column sm:flex-row">
                <div>
                  <Button
                    icon="pi pi-search"
                    label="Expand All"
                    class="mr-2 mb-2"
                    @click="expandAll"
                  />

                  <Button
                    icon="pi pi-minus"
                    label="Collapse All"
                    class="mr-2 mb-2"
                    @click="collapseAll"
                  />
                </div>
              </div>
            </template>
            <Column field="title" header="Title" expander></Column>
            <Column field="type" header="Typ"></Column>
            <Column field="description" header="Beschreibung"></Column>
            <Column field="tenant" header="Mieter"></Column>
            <Column field="usable_space" header="Fläche"></Column>
            <Column frozen alignFrozen="right">
              <template #body="{ data }">
                <div class="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    icon="pi pi-pencil"
                    rounded
                    severity="success"
                    @click="completeEntityAction(data.type, 'edit', data.key)"
                  />
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    rounded
                    severity="danger"
                    @click="completeEntityAction(data.type, 'delete', data.key)"
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

<style scoped>
.custom-scroll-height {
  --custom-scroll-height: 30vw;
}

.outline-button {
  border: 1px solid #000;
}

.create-button {
  margin-left: auto;
}
</style>
