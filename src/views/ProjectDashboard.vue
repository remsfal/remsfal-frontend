<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  projectId: string;
  title?: string;
}>();

const { t } = useI18n();
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">
      {{ t('projectDashboard.title', [projectId]) }}
    </h2>
    <p class="mb-6 text-gray-600">Hier findest du eine Übersicht über dein aktuelles Projekt.</p>

    <div class="grid gap-4 md:grid-cols-3">
      <div class="bg-gray-100 p-4 rounded shadow">
        <p class="text-sm text-gray-500 mb-1">Projekt-ID</p>
        <p class="font-semibold break-all">{{ projectId }}</p>
      </div>

      <div class="bg-gray-100 p-4 rounded shadow">
        <p class="text-sm text-gray-500 mb-1">Aktueller Status</p>
        <p class="font-semibold">In Bearbeitung</p>
      </div>

      <div class="bg-gray-100 p-4 rounded shadow">
        <p class="text-sm text-gray-500 mb-1">Letzte Änderung</p>
        <p class="font-semibold">Gerade eben</p>
      </div>
    </div>
  </div>
</template>
