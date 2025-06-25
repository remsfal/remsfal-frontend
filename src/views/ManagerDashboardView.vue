<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useProjectStore } from '@/stores/ProjectStore';
import { taskService } from '@/services/TaskService';

const projectStore = useProjectStore();

const projektAnzahl = ref(0);
const offeneAufgaben = ref(0);
const gemeldeteMaengel = ref(0);

onMounted(async () => {
  await projectStore.refreshProjectList();
  projektAnzahl.value = projectStore.projects.length;

  try {
    const projectId = projectStore.projectId;
    if (!projectId) {
      console.warn('Kein Projekt ausgewählt – Aufgaben können nicht geladen werden.');
      return;
    }

    const taskList = await taskService.getTasks(projectId, 'OPEN');
    offeneAufgaben.value = taskList.tasks.length;
  } catch (err) {
    console.warn('Fehler beim Laden der Aufgaben:', err);
  }

});
</script>
<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Verwalter-Dashboard</h2>
    <p>Hier siehst du eine Übersicht aller verwalteten Projekte und Aufgaben.</p>

    <div class="grid gap-4 mt-4 md:grid-cols-3">
      <div class="p-4 bg-gray-900 rounded shadow">
        <h3 class="text-lg font-semibold">Projekte</h3>
        <p class="text-2xl">{{ projektAnzahl }}</p>
      </div>
      <div class="p-4 bg-gray-900 rounded shadow">
        <h3 class="text-lg font-semibold">Offene Aufgaben</h3>
        <p class="text-2xl">{{ offeneAufgaben }}</p>
      </div>
      <div class="p-4 bg-gray-900 rounded shadow">
        <h3 class="text-lg font-semibold">Mängel gemeldet</h3>
        <p class="text-2xl">{{ gemeldeteMaengel }}</p>
      </div>
    </div>
  </div>
</template>
