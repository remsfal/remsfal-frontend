<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import TreeSelect from 'primevue/treeselect';
import type { TreeNode } from 'primevue/treenode';
import type { RentalUnitTreeNodeJson } from '../services/PropertyService';
import { useRentableUnitsStore } from '@/features/project/rentableUnits/stores/RentableUnitsStore';

const props = defineProps<{
  projectId: string;
  modelValue: string | null;
  excludeUnitIds?: string[];
  invalid?: boolean;
  inputId?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
  nodeSelect: [node: TreeNode];
}>();

const { t } = useI18n();
const rentableUnitsStore = useRentableUnitsStore();

const rawTree = ref<RentalUnitTreeNodeJson[]>([]);
const isLoading = ref(false);

const excludedUnitIds = computed(() => new Set(props.excludeUnitIds ?? []));

function transformTreeNodes(nodes: RentalUnitTreeNodeJson[]): TreeNode[] {
  return nodes.map((node) => {
    const unitType = node.data?.type ? t(`unitTypes.${node.data.type.toLowerCase()}`) : '';
    const title = node.data?.title || 'Unbenannt';

    return {
      key: node.key,
      label: `${title} (${unitType})`,
      data: node.data,
      children: node.children ? transformTreeNodes(node.children) : undefined,
      selectable:
        node.data?.type !== undefined &&
        node.data.type !== 'PROPERTY' &&
        !excludedUnitIds.value.has(node.key),
    };
  });
}

const propertyTree = computed<TreeNode[]>(() => transformTreeNodes(rawTree.value));

onMounted(async () => {
  isLoading.value = true;
  try {
    await rentableUnitsStore.fetchRentalUnitTree(props.projectId);
    rawTree.value = rentableUnitsStore.rentableUnitTree;
  } catch (error) {
    console.error('Failed to load property tree:', error);
  } finally {
    isLoading.value = false;
  }
});

function onNodeSelect(node: TreeNode) {
  emit('nodeSelect', node);
}
</script>

<template>
  <TreeSelect
    :modelValue="modelValue"
    :inputId="inputId"
    :options="propertyTree"
    :loading="isLoading"
    :placeholder="t('rentableUnitSelect.placeholder')"
    :class="{ 'p-invalid': invalid }"
    selectionMode="single"
    fluid
    @update:modelValue="emit('update:modelValue', $event as string | null)"
    @nodeSelect="onNodeSelect"
  />
</template>
