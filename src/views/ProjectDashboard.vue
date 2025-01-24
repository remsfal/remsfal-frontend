<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  projectId: string;
  title?: string;
}>();
const { t } = useI18n();
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <h1>{{ t('projectDashboard.title', [projectId]) }}</h1>
      <Button v-styleclass="{ selector: '@next', toggleClass: 'p-hidden' }" label="Toggle p-disabled" />
      <InputText />
    </div>
  </main>
</template>
