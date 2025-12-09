<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Breadcrumb from 'primevue/breadcrumb';
import { propertyService, toRentableUnitView } from '@/services/PropertyService';

interface BreadcrumbItem {
  label?: string;
  command?: () => void;
  disabled?: boolean;
  to?: any;
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

const getIconForType = (type: string): string => {
  switch (type) {
    case 'PROPERTY': return 'pi pi-map';
    case 'BUILDING': return 'pi pi-building';
    case 'APARTMENT': return 'pi pi-home';
    case 'COMMERCIAL': return 'pi pi-briefcase';
    case 'STORAGE': return 'pi pi-box';
    case 'SITE': return 'pi pi-tree';
    default: return 'pi pi-folder';
  }
};

const loadBreadcrumbs = async () => {
  const targetId = props.mode === 'create' ? props.parentId : props.unitId;
  let pathNodes: { title: string; id: string; type: any }[] = [];

  // 1. Normalen Pfad laden
  if (targetId && props.projectId) {
    try {
      pathNodes = await propertyService.getBreadcrumbPath(props.projectId, targetId);
    } catch {
      // Fehler ignorieren
    }
  }

  // 2. Grundstück erzwingen (Context Parent)
  if (props.contextParentId && props.projectId) {
    const parentExists = pathNodes.some((node) => node.id === props.contextParentId);
    
    if (!parentExists) {
      // VERSUCH A: Über den Baum
      try {
        const parentPath = await propertyService.getBreadcrumbPath(
          props.projectId,
          props.contextParentId,
        );
        if (parentPath.length > 0) {
          pathNodes = [...parentPath, ...pathNodes];
        } else {
          throw new Error('Baum-Pfad leer');
        }
      } catch { 
        // VERSUCH B (FALLBACK): Direkt laden
        try {
          const propertyData = await propertyService.getProperty(
            props.projectId,
            props.contextParentId,
          );
          const propertyNode = {
            title: propertyData.title || 'Unbenanntes Grundstück',
            id: props.contextParentId,
            type: 'PROPERTY' as any,
          };
          pathNodes = [propertyNode, ...pathNodes];
        } catch {
          // Ignorieren
        }
      }
    }
  }

  // 3. Konvertieren & ICONS HINZUFÜGEN
  let pathItems: BreadcrumbItem[] = pathNodes.map((node) => ({
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

  // 4. Das letzte Stück (Wir selbst)
  if (props.mode === 'create') {
    pathItems.push({
      label: 'Neu anlegen',
      icon: 'pi pi-plus',
      disabled: true,
    });
  } else {
    const lastItem = pathItems.length > 0 ? pathItems[pathItems.length - 1] : null;
     
    // Wenn wir noch fehlen
    if (!lastItem || (props.unitId && lastItem.id !== props.unitId)) {
      pathItems.push({
        label: props.currentTitle || 'Laden...',
        disabled: true,
        icon: 'pi pi-circle-fill',
      });
    } else {
      // Wir sind da -> Deaktivieren
      lastItem.disabled = true;
      if (props.currentTitle) lastItem.label = props.currentTitle;
    }
  }

  // Fallback
  if (pathItems.length === 0) {
    pathItems.push({
      label: 'Zur Übersicht',
      icon: 'pi pi-arrow-left',
      command: () => router.push({
        name: 'RentableUnitsView',
        params: { projectId: props.projectId },
      }),
    });
  }

  items.value = [...pathItems];
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

/* HIER WAREN DIE FEHLER: Leerzeilen eingefügt */

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