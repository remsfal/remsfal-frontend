<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Breadcrumb from 'primevue/breadcrumb';
import { propertyService, toRentableUnitView, type UnitType } from '@/services/PropertyService';

// --- Interfaces für Typensicherheit ---
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
const items = ref<BreadcrumbItem[]>([]);

// --- Hilfsfunktionen ---

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

// Lädt die rohen Daten (Nodes)
const fetchPathNodes = async (targetId: string | undefined): Promise<BreadcrumbNode[]> => {
  // Sicherheitscheck für Tests: Existiert die Methode im Mock?
  if (!targetId || !props.projectId || typeof propertyService.getBreadcrumbPath !== 'function') {
    return [];
  }
  try {
    return (await propertyService.getBreadcrumbPath(props.projectId, targetId)) as BreadcrumbNode[];
  } catch {
    return [];
  }
};

// Ergänzt fehlendes Elternteil (für SiteView)
const ensureContextParent = async (currentNodes: BreadcrumbNode[]): Promise<BreadcrumbNode[]> => {
  if (!props.contextParentId || !props.projectId || typeof propertyService.getBreadcrumbPath !== 'function') {
    return currentNodes;
  }

  const parentExists = currentNodes.some((node) => node.id === props.contextParentId);
  if (parentExists) return currentNodes;

  try {
    // Versuch 1: Über den Baum laden
    const parentPath = (await propertyService.getBreadcrumbPath(
      props.projectId,
      props.contextParentId,
    )) as BreadcrumbNode[];
    
    if (parentPath.length > 0) {
      return [...parentPath, ...currentNodes];
    }
    
    // Versuch 2: Direkt laden (Fallback)
    // Auch hier Sicherheitscheck für Tests
    if (typeof propertyService.getProperty === 'function') {
      const propertyData = await propertyService.getProperty(props.projectId, props.contextParentId);
      const propertyNode: BreadcrumbNode = {
        title: propertyData.title || 'Unbenanntes Grundstück',
        id: props.contextParentId,
        type: 'PROPERTY' as UnitType,
      };
      return [propertyNode, ...currentNodes];
    }
    return currentNodes;
  } catch {
    return currentNodes;
  }
};

// Konvertiert Nodes in Breadcrumb Items
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

// Verarbeitet das letzte Element (Neu / Edit)
const processLastItem = (list: BreadcrumbItem[]) => {
  const newList = [...list];

  // Modus: Create
  if (props.mode === 'create') {
    newList.push({ label: 'Neu anlegen', icon: 'pi pi-plus', disabled: true });
    return newList;
  }

  // Modus: Edit
  const lastItem = newList.length > 0 ? newList[newList.length - 1] : undefined;
  const isSelfInList = lastItem && props.unitId && lastItem.id === props.unitId;

  if (!isSelfInList) {
    // Wir fehlen in der Liste -> Manuell anhängen
    newList.push({
      label: props.currentTitle || 'Außenanlage',
      disabled: true,
      icon: 'pi pi-circle-fill',
    });
  } else if (lastItem) { // Check für TS 'possibly undefined'
    // Wir sind in der Liste -> Deaktivieren & Titel updaten
    lastItem.disabled = true;
    if (props.currentTitle) lastItem.label = props.currentTitle;
  }

  return newList;
};

// --- Haupt-Logik ---
const loadBreadcrumbs = async () => {
  const targetId = props.mode === 'create' ? props.parentId : props.unitId;

  // 1. Laden & Ergänzen
  let pathNodes = await fetchPathNodes(targetId);
  pathNodes = await ensureContextParent(pathNodes);

  // 2. Mappen & Veredeln
  let resultItems = mapNodesToItems(pathNodes);
  resultItems = processLastItem(resultItems);

  // 3. Fallback bei leerer Liste
  if (resultItems.length === 0) {
    resultItems.push({
      label: 'Zur Übersicht',
      icon: 'pi pi-arrow-left',
      command: () => router.push({ 
        name: 'RentableUnitsView', 
        params: { projectId: props.projectId } 
      }),
    });
  }

  items.value = resultItems;
};

onMounted(() => { loadBreadcrumbs(); });

watch(
  () => [props.unitId, props.parentId, props.currentTitle, props.projectId, props.contextParentId],
  () => { loadBreadcrumbs(); },
);
</script>

<template>
  <Breadcrumb :model="items" class="custom-breadcrumb mb-4 pl-0" />
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