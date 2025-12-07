<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Breadcrumb from 'primevue/breadcrumb';
import { propertyService, toRentableUnitView } from '@/services/PropertyService';

const props = defineProps<{ 
  projectId: string; 
  unitId?: string;       // ID der Einheit (zum Bearbeiten)
  parentId?: string;     // ID des Elternteils (beim Erstellen)
  currentTitle?: string; // Titel der aktuellen Seite (optional)
  mode?: 'edit' | 'create';
}>();

const home = ref({ icon: 'pi pi-home', to: '/' }); // Ggf. anpassen auf Dashboard-Route
const items = ref<any[]>([]);

// Lädt die Pfad-Daten vom Backend
const loadBreadcrumbs = async () => {
  // 1. Basis-Pfad: Immer "Projekte" -> "Übersicht"
  const baseItems = [
    { label: 'Projekte', to: '/projects' }, // Passe '/projects' an deine Route an
    { 
      label: 'Wirtschaftseinheiten', 
      to: { name: 'RentableUnitsView', params: { projectId: props.projectId } } 
    }
  ];

  let pathItems: any[] = [];
  
  // Entscheiden, welche ID wir suchen (die eigene oder die des Elternteils)
  const targetId = props.mode === 'create' ? props.parentId : props.unitId;

  if (targetId) {
    try {
      // 2. Den Pfad vom Service holen (Deine neue Methode!)
      const pathData = await propertyService.getBreadcrumbPath(props.projectId, targetId);
      
      // 3. Pfad in Breadcrumb-Items umwandeln
      pathItems = pathData.map(node => ({
        label: node.title,
        to: { 
          name: toRentableUnitView(node.type), 
          params: { projectId: props.projectId, unitId: node.id } 
        }
      }));
    } catch (e) {
      console.error("Breadcrumb Fehler:", e);
    }
  }

  // 4. Den letzten Teil hinzufügen (Bearbeiten vs. Neu Erstellen)
  if (props.mode === 'create') {
     // Wir sind im Erstell-Modus, also fügen wir "Neu..." hinzu
     pathItems.push({ label: 'Neu anlegen', disabled: true, class: 'font-bold' });
  } else {
     // Wir sind im Bearbeiten-Modus
     // Wenn wir einen aktuellen Titel haben (z.B. "Musterstraße 12"), zeigen wir ihn an
     // Falls nicht (weil noch am Laden), zeigt der Pfad zumindest bis zum Parent korrekt an.
     if (props.currentTitle) {
        // Falls der Titel schon im pathItems ist (manchmal ist der letzte Node das Item selbst),
        // müssten wir ihn ggf. deaktivieren. Einfacher ist:
        // Wir nehmen an, pathItems enthält den Pfad bis inkl. der aktuellen Unit.
        if (pathItems.length > 0) {
            pathItems[pathItems.length - 1].disabled = true; // Die aktuelle Seite ist nicht klickbar
        }
     }
  }

  // Alles zusammenfügen
  items.value = [...baseItems, ...pathItems];
};

// Initial laden
onMounted(() => {
  loadBreadcrumbs();
});

// Neu laden, wenn sich IDs ändern (wichtig, wenn man zwischen Einheiten navigiert)
watch(() => [props.unitId, props.parentId, props.currentTitle], () => {
  loadBreadcrumbs();
});
</script>

<template>
  <Breadcrumb 
    :home="home" 
    :model="items" 
    class="custom-breadcrumb mb-4 pl-0" 
  />
</template>

<style scoped>
/* Styling, damit es so aussieht wie in deinem Screenshot (ohne grauen Kasten) */
.custom-breadcrumb {
    background: transparent;
    border: none;
    padding: 0;
    font-size: 0.875rem; /* Etwas kleinerer Text wie üblich bei Breadcrumbs */
}

/* Optional: Farbe der Links anpassen */
:deep(.p-menuitem-link) {
    padding-left: 0 !important;
}
</style>