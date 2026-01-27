<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Breadcrumb from 'primevue/breadcrumb';
import BaseCard from '@/components/common/BaseCard.vue';
import { useI18n } from 'vue-i18n';
import { propertyService, toRentableUnitView, type UnitType } from '@/services/PropertyService';

interface BreadcrumbNode {
  title: string;
  id: string;
  type: UnitType;
}

interface BreadcrumbItem {
  label: string;
  command?: () => void;
  disabled?: boolean;
  to?: unknown; 
  id?: string;
  icon?: string;
}

const props = defineProps<{ 
  projectId: string; 
  unitId?: string;       
  parentId?: string;     
  contextParentId?: string; 
  currentTitle?: string; 
  mode?: 'edit' | 'create';
}>();

const router = useRouter();
const { t } = useI18n();
const items = ref<BreadcrumbItem[]>([]);

const getIconForType = (type: string): string => {
  const icons: Record<string, string> = {
    PROPERTY: 'pi pi-map',
    BUILDING: 'pi pi-building',
    APARTMENT: 'pi pi-home',
    COMMERCIAL: 'pi pi-briefcase',
    STORAGE: 'pi pi-box',
    SITE: 'pi pi-tree',
  };
  return icons[type] || 'pi pi-folder';
};

const fetchPathNodes = async (targetId: string | undefined): Promise<BreadcrumbNode[]> => {
  if (!targetId || !props.projectId || typeof propertyService.getBreadcrumbPath !== 'function') {
    return [];
  }
  try {
    return (await propertyService.getBreadcrumbPath(props.projectId, targetId)) as BreadcrumbNode[];
  } catch {
    return [];
  }
};

const ensureContextParent = async (currentNodes: BreadcrumbNode[]): Promise<BreadcrumbNode[]> => {
  if (!props.contextParentId || !props.projectId) return currentNodes;

  const parentExists = currentNodes.some((node) => node.id === props.contextParentId);
  if (parentExists) return currentNodes;

  if (typeof propertyService.getBreadcrumbPath === 'function') {
    try {
      const parentPath = (await propertyService.getBreadcrumbPath(
        props.projectId,
        props.contextParentId,
      )) as BreadcrumbNode[];
      
      if (parentPath.length > 0) {
        return [...parentPath, ...currentNodes];
      }
    } catch {
      // Ignore
    }
  }
    
  if (typeof propertyService.getProperty === 'function') {
    try {
      const propertyData = await propertyService.getProperty(props.projectId, props.contextParentId);
      const propertyNode: BreadcrumbNode = {
        title: propertyData.title || t('breadcrumb.unnamedProperty'), 
        id: props.contextParentId,
        type: 'PROPERTY' as UnitType,
      };
      return [propertyNode, ...currentNodes];
    } catch {
      // Ignore
    }
  }
  
  return currentNodes;
};

const mapNodesToItems = (nodes: BreadcrumbNode[]): BreadcrumbItem[] => {
  return nodes.map((node) => ({
    label: node.title,
    id: node.id,
    icon: getIconForType(node.type),
    command: () => {
      router.push({ 
        name: toRentableUnitView(node.type), 
        params: { projectId: props.projectId, unitId: node.id }, 
      });
    },
  }));
};

const processLastItem = (list: BreadcrumbItem[]) => {
  const newList = [...list];

  if (props.mode === 'create') {
    newList.push({
      label: t('breadcrumb.create'),
      icon: 'pi pi-plus',
      disabled: true,
    });
    return newList;
  }

  const lastItem = newList.length > 0 ? newList[newList.length - 1] : undefined;
  const isSelfInList = lastItem && props.unitId && lastItem.id === props.unitId;

  if (!isSelfInList) {
    const fallbackLabel = props.currentTitle ?? (props.unitId ? t('breadcrumb.outdoor') : null);
    
    if (fallbackLabel) {
      newList.push({
        label: fallbackLabel,
        disabled: true,
        icon: 'pi pi-circle-fill',
      });
    }
  } else if (lastItem) {
    lastItem.disabled = true;
    if (props.currentTitle) lastItem.label = props.currentTitle;
  }

  return newList;
};

const loadBreadcrumbs = async () => {
  const targetId = props.mode === 'create' ? props.parentId : props.unitId;

  let pathNodes = await fetchPathNodes(targetId);
  pathNodes = await ensureContextParent(pathNodes);

  let resultItems = mapNodesToItems(pathNodes);
  resultItems = processLastItem(resultItems);

  // Always prepend "Übersicht" link as first breadcrumb item
  resultItems.unshift({
    label: t('breadcrumb.overview'),
    icon: 'pi pi-th-large',
    command: () => router.push({
      name: 'RentableUnits',
      params: { projectId: props.projectId }
    }),
  });

  items.value = resultItems;
};

onMounted(() => { loadBreadcrumbs(); });

watch(
  () => [props.unitId, props.parentId, props.currentTitle, props.projectId, props.contextParentId],
  () => { loadBreadcrumbs(); },
);
</script>

<template>
  <BaseCard>
    <template #content>
      <Breadcrumb :model="items" class="custom-breadcrumb" />
    </template>
  </BaseCard>
</template>

<style scoped>
.custom-breadcrumb {
  background: transparent;
  border: none;
  padding: 0;
  font-size: 0.875rem;
}

:deep(.p-menuitem-link) {
  padding-left: 0 !important;
  text-decoration: none !important;
}

:deep(.p-disabled) {
  opacity: 1 !important;
  font-weight: bold;
  color: #6c757d;
  cursor: default !important;
  pointer-events: none;
}

:deep(.p-menuitem-icon) {
  color: #666;
  margin-right: 0.5rem;
}
</style>