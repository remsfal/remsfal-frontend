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

const loadBreadcrumbs = async () => {
  const targetId = props.mode === 'create' ? props.parentId : props.unitId;
  let pathNodes: { title: string; id: string; type: any }[] = [];

  // 1. Versuch: Pfad aus dem Baum laden
  if (targetId && props.projectId) {
    try {
      pathNodes = await propertyService.getBreadcrumbPath(props.projectId, targetId);
    } catch (e) { }
  }

  // 2. Grundstück erzwingen (contextParentId)
  if (props.contextParentId && props.projectId) {
    const parentExists = pathNodes.some(node => node.id === props.contextParentId);
    
    if (!parentExists) {
        // VERSUCH A: Über den Baum
        try {
           const parentPath = await propertyService.getBreadcrumbPath(props.projectId, props.contextParentId);
           if (parentPath.length > 0) {
               pathNodes = [...parentPath, ...pathNodes];
           } else {
               throw new Error('Baum-Pfad leer');
           }
        } catch (e) { 
           // VERSUCH B (FALLBACK): Direkt die Property-Daten laden!
           // Das funktioniert auch, wenn der Baum kaputt ist.
           try {
               const propertyData = await propertyService.getProperty(props.projectId, props.contextParentId);
               const propertyNode = {
                   title: propertyData.title || 'Unbenanntes Grundstück',
                   id: props.contextParentId, // Wir wissen die ID ja
                   type: 'PROPERTY' as any
               };
               // Wir kleben diesen Node manuell davor
               pathNodes = [propertyNode, ...pathNodes];
           } catch (apiErr) {
               console.warn('Konnte Grundstück auch nicht direkt laden:', apiErr);
           }
        }
    }
  }

  // 3. Konvertieren
  let pathItems: BreadcrumbItem[] = pathNodes.map((node) => ({
    label: node.title,
    id: node.id,
    command: () => {
      router.push({ 
        name: toRentableUnitView(node.type), 
        params: { projectId: props.projectId, unitId: node.id }, 
      });
    }
  }));

  // 4. Das letzte Stück (Wir selbst / Außenanlage)
  if (props.mode === 'create') {
     pathItems.push({ label: 'Neu anlegen', disabled: true });
  } else {
     const lastItem = pathItems.length > 0 ? pathItems[pathItems.length - 1] : null;
     
     // Wenn wir noch fehlen -> Anhängen
     if (!lastItem || (props.unitId && lastItem.id !== props.unitId)) {
         pathItems.push({
             label: props.currentTitle || 'Außenanlage',
             disabled: true
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
          command: () => router.push({ name: 'RentableUnitsView', params: { projectId: props.projectId } })
      });
  }

  items.value = [...pathItems];
};

onMounted(() => { loadBreadcrumbs(); });

watch(() => [props.unitId, props.parentId, props.currentTitle, props.projectId, props.contextParentId], () => {
  loadBreadcrumbs();
});
</script>

<template>
  <Breadcrumb :model="items" class="custom-breadcrumb mb-4 pl-0" />
</template>

<style scoped>
.custom-breadcrumb { background: transparent; border: none; padding: 0; font-size: 0.875rem; }
:deep(.p-menuitem-link) { padding-left: 0 !important; text-decoration: none !important; }
:deep(.p-disabled) { opacity: 1 !important; font-weight: bold; color: #6c757d; cursor: default !important; pointer-events: none; }
</style>