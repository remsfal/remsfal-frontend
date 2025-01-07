<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import NewProjectForm from '@/components/NewProjectForm.vue';
import ProjectSelectionTable from '@/components/ProjectSelectionTable.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const { t } = useI18n();

const display = ref(false);

const open = () => {
  display.value = true;
};

const close = () => {
  display.value = false;
};
</script>

<template>
  <div class="grid">
    <div class="col-10">
      <div class="card">
        <h5>{{ t('projectSelection.title') }}</h5>
        <ProjectSelectionTable />
      </div>
    </div>
    <div class="col-2">
      <Button
        :label="t('projectSelection.add')"
        icon="pi pi-plus"
        style="width: auto"
        @click="open"
      />
      <Dialog
        :header="t('projectSelection.add')"
        v-model:visible="display"
        :breakpoints="{ '960px': '75vw' }"
        :style="{ width: '30vw' }"
        :modal="true"
      >
        <div style="margin-top: 1.2em">
          <NewProjectForm @abort="close" @submit="close"></NewProjectForm>
        </div>
      </Dialog>
    </div>
  </div>
</template>