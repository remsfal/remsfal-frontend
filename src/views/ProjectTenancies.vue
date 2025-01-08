<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  projectId: string;
}>();
const { t } = useI18n();
</script>

<template>
  <main>
    <div class="grid">
      <h1>{{ t('projectTenancies.title', [projectId]) }}</h1>
    </div>
  </main>
</template>
