<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import TreeTable, { type TreeTableExpandedKeys, type TreeTableSelectionKeys } from 'primevue/treetable';
import type { RentalUnitTreeNodeJson } from '@/services/PropertyService';
import { toRentableUnitView } from '@/services/PropertyService';
import type { components } from '@/services/api/platform-schema';
import NewRentableUnitButton from './NewRentableUnitButton.vue';
import NewPropertyButton from './NewPropertyButton.vue';

const props = defineProps<{
  projectId: string;
  rentableUnitTree: RentalUnitTreeNodeJson[];
  expandedKeys: TreeTableExpandedKeys;
}>();

const emit = defineEmits<{
  'update:expandedKeys': [value: TreeTableExpandedKeys];
  expandAll: [];
  collapseAll: [];
  newUnit: [title: string];
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

function onNodeSelect(node: RentalUnitTreeNodeJson) {
  const nodeData = node.data;
  if (!nodeData?.type) return;
  const view = toRentableUnitView(nodeData.type as components['schemas']['UnitType']);
  router.push({
    name: view as string,
    params: { projectId: props.projectId, unitId: node.key }
  } as Parameters<typeof router.push>[0]);
}

function translateType(type: string): string {
  return t(`unitTypes.${type.toLowerCase()}`);
}

function onNewRentableUnit(title: string) {
  emit('newUnit', title);
}
</script>

<template>
  <TreeTable
    v-model:selectionKeys="selectedKey"
    :expandedKeys="props.expandedKeys"
    :value="props.rentableUnitTree"
    selectionMode="single"
    :metaKeySelection="false"
    scrollable
    pt:footer="gap-2 min-h-[46.5px] p-0!"
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

    <Column
      field="type"
      :header="t('rentableUnits.table.type')"
      headerClass="hidden md:table-cell"
      bodyClass="hidden md:table-cell"
    >
      <template #body="{ node }">
        <div>{{ translateType(node.data.type) }}</div>
      </template>
    </Column>

    <Column
      field="description"
      :header="t('rentableUnits.table.description')"
      headerClass="hidden lg:table-cell"
      bodyClass="hidden lg:table-cell"
    >
      <template #body="{ node }">
        <div>{{ node.data.description }}</div>
      </template>
    </Column>

    <Column
      field="tenant"
      :header="t('rentableUnits.table.tenant')"
      headerClass="hidden md:table-cell"
      bodyClass="hidden md:table-cell"
    >
      <template #body="{ node }">
        <div>{{ node.data.tenant }}</div>
      </template>
    </Column>

    <Column
      field="usable_space"
      :header="t('rentableUnits.table.area')"
      headerClass="hidden lg:table-cell"
      bodyClass="hidden lg:table-cell"
    >
      <template #body="{ node }">
        <div>{{ node.data.usable_space }}</div>
      </template>
    </Column>

    <Column frozen alignFrozen="right" bodyClass="flex flex-wrap justify-end gap-2 min-h-[46.5px] p-0! items-center">
      <template #body="{ node }">
        <NewRentableUnitButton
          :projectId="props.projectId"
          :parentId="node.key"
          :type="node.data.type"
          @newUnit="onNewRentableUnit"
        />
      </template>
    </Column>
    <template #footer>
      <div class="flex justify-end items-center min-h-[46.5px]">
        <NewPropertyButton :projectId="props.projectId" @newUnit="onNewRentableUnit" />
      </div>
    </template>
  </TreeTable>
</template>
