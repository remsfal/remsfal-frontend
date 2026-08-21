<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import TreeSelect from 'primevue/treeselect';
import type { TreeNode } from 'primevue/treenode';
import { propertyService, type RentalUnitTreeNodeJson } from '../services/PropertyService';

const props = defineProps<{
  projectId: string;
  modelValue: string | null;
  excludeUnitIds?: string[];
  invalid?: boolean;
  inputId?: string;
  leafNodeSelectionOnly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
  nodeSelect: [node: TreeNode];
}>();

const { t } = useI18n();

const rawTree = ref<RentalUnitTreeNodeJson[]>([]);
const isLoading = ref(false);

const excludedUnitIds = computed(() => new Set(props.excludeUnitIds ?? []));

function transformTreeNodes(nodes: RentalUnitTreeNodeJson[]): TreeNode[] {
  return nodes.map((node) => {
    const unitType = node.data?.type ? t(`unitTypes.${node.data.type.toLowerCase()}`) : '';
    const title = node.data?.title || 'Unbenannt';
    const isLeaf = !node.children || node.children.length === 0;

    return {
      key: node.key,
      label: `${title} (${unitType})`,
      data: node.data,
      children: node.children ? transformTreeNodes(node.children) : undefined,
      selectable:
        node.data?.type !== undefined &&
        (!props.leafNodeSelectionOnly || isLeaf) &&
        !excludedUnitIds.value.has(node.key),
    };
  });
}

const propertyTree = computed<TreeNode[]>(() => transformTreeNodes(rawTree.value));

onMounted(async () => {
  isLoading.value = true;
  try {
    const data = await propertyService.getPropertyTree(props.projectId);
    rawTree.value = (data.properties || []) as RentalUnitTreeNodeJson[];
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
