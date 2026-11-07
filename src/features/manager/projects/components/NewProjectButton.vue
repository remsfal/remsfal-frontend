<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import NewProjectDialog from './NewProjectDialog.vue';

const { t } = useI18n();

const visible = ref(false);
</script>

<template>
  <Button
    :label="t('projectSelection.add')"
    icon="pi pi-plus"
    style="width: auto"
    @click="visible = true"
  />

  <NewProjectDialog v-model:visible="visible" />
</template>
