<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ProjectService from '@/services/ProjectService';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

const props = defineProps<{
  projectId: string;
}>();

const title = ref('');
const description = ref('');
const router = useRouter();
const projectService = new ProjectService();

const createProperty = () => {
  console.log('createProperty called');
  if (!title.value) {
    console.log('Title is empty, no navigation occurs');
    alert('Titel ist ein Pflichtfeld!');
    return;
  }

  console.log('Calling projectService.createProperty');
  projectService
      .createProperty(props.projectId, {
        title: title.value,
        description: description.value,
        landRegisterEntry: '',
        plotArea: 0,
        effective_space: 0,
      })
      .then(() => {
        console.log('Navigation triggered');
        router.push(`/project/${props.projectId}/objects`);
      })
      .catch((err) => {
        console.error('Fehler beim Erstellen des Eigentums:', err);
      });
};


const cancel = () => {
  router.push(`/project/${props.projectId}/objects`);
};
</script>

<template>
  <div class="col-12">
    <div class="card">
      <h5>Erstelle neues Eigentum</h5>
      <div class="p-fluid formgrid grid">
        <div class="field col-12">
          <label for="title">Titel</label>
          <InputText id="title" v-model="title" type="text" />
        </div>
        <div class="field col-12">
          <label for="description">Beschreibung</label>
          <Textarea id="description" v-model="description" rows="4" class="no-resize" />
        </div>
        <div class="field col-12 text-right">
          <Button label="Erstellen" icon="pi pi-check" @click="createProperty" class="mr-2" />
          <Button label="Abbrechen" icon="pi pi-times" @click="cancel" class="p-button-secondary" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.text-right {
  text-align: right;
}

.no-resize {
  resize: none;
}
</style>
