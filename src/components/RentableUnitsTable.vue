<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import TreeTable, { type TreeTableExpandedKeys, type TreeTableSelectionKeys } from 'primevue/treetable';
import type { RentableUnitTreeNode } from '@/services/PropertyService';
import { toRentableUnitView } from '@/services/PropertyService';
import type { components } from '@/services/api/platform-schema';
import NewRentableUnitButton from '@/components/NewRentableUnitButton.vue';
import DeleteRentableUnitButton from '@/components/DeleteRentableUnitButton.vue';
import NewPropertyButton from '@/components/NewPropertyButton.vue';

const props = defineProps<{
  projectId: string;
  rentableUnitTree: RentableUnitTreeNode[];
  isLoading: boolean;
  expandedKeys: TreeTableExpandedKeys;
}>();

const emit = defineEmits<{
  'update:expandedKeys': [value: TreeTableExpandedKeys];
  expandAll: [];
  collapseAll: [];
  newUnit: [title: string];
  deleteNode: [node: RentableUnitTreeNode];
}>();

const { t } = useI18n();
const router = useRouter();

const selectedKey = ref<TreeTableSelectionKeys>({});

function expandAll() {
  emit('expandAll');
}

function collapseAll() {
  emit('collapseAll');
}

function onNodeSelect(node: RentableUnitTreeNode) {
  const nodeData = node.data;
  if (!nodeData?.type) return;
  const view = toRentableUnitView(nodeData.type as components['schemas']['UnitType']);
  router.push({ name: view, params: { projectId: props.projectId, unitId: node.key } });
}

function translateType(type: string): string {
  return t(`unitTypes.${type.toLowerCase()}`);
}

function onNewRentableUnit(title: string) {
  emit('newUnit', title);
}

function onDeleteNode(node: RentableUnitTreeNode) {
  emit('deleteNode', node);
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('rentableUnits.view.title') }}
    </template>

    <template #content>
      <TreeTable
        v-model:selectionKeys="selectedKey"
        :expandedKeys="props.expandedKeys"
        :value="props.rentableUnitTree"
        selectionMode="single"
        :metaKeySelection="false"
        scrollable
        :loading="props.isLoading"
        @update:expandedKeys="emit('update:expandedKeys', $event)"
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
            <div>{{ translateType(node.data.type) }}</div>
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
              <DeleteRentableUnitButton :node="node" @delete="onDeleteNode" />
            </div>
          </template>
        </Column>
      </TreeTable>
      <div class="flex justify-end basis-auto mt-6">
        <NewPropertyButton :projectId="props.projectId" @newUnit="onNewRentableUnit" />
      </div>
    </template>
  </BaseCard>
</template>

<style scoped></style>
