<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import NewProjectDialog from '@/components/NewProjectDialog.vue';
import ProjectSelectionTable from '@/components/ProjectSelectionTable.vue';
import Button from 'primevue/button';

const { t } = useI18n();

const showDialog = ref(false);
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-10">
      <div class="card">
        <h5>{{ t('projectSelection.title') }}</h5>
        <ProjectSelectionTable />
      </div>
    </div>
    <div class="col-span-2">
      <Button
        :label="t('projectSelection.add')"
        icon="pi pi-plus"
        style="width: auto"
        @click="showDialog = true"
      />
    </div>
  </div>

  <NewProjectDialog v-model:visible="showDialog" />
</template>
