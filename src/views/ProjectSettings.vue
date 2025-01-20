<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  projectId: string;
}>();
const { t } = useI18n();
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <h1>{{ t('projectSettings.title', [projectId]) }}</h1>
    </div>
  </main>
</template>
