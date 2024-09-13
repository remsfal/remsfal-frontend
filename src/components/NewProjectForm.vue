<script setup lang="ts">
import { defineEmits, ref, watch } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import ProjectService, { type Project, ProjectItem } from '@/services/ProjectService';
import { useProjectStore } from '@/stores/ProjectStore';
import { useRouter } from 'vue-router';

const emit = defineEmits<{
  abort: [];
}>();

const maxLength = 100;
const projectTitle = ref('');
const errorMessage = ref('');

const router = useRouter();

watch(projectTitle, (newProjectTitle) => {
  if (newProjectTitle.length > maxLength) {
    errorMessage.value = `Der Projekttitel darf nicht mehr als ${maxLength} Zeichen lang sein`;
  } else {
    errorMessage.value = '';
  }
});

function createProject() {
  const projectService = new ProjectService();
  const projectStore = useProjectStore();

  if (projectTitle.value.length > maxLength) return;

  projectService.createProject(projectTitle.value).then((newProject: Project) => {
    const newProjectItem: ProjectItem = {
      id: newProject.id,
      name: newProject.title,
      memberRole: 'MANAGER',
    };
    projectStore.searchSelectedProject(newProjectItem);
    console.info('new project has been created: ', newProject);
    router.push({
      name: 'ProjectDashboard',
      params: { projectId: newProject.id },
    });
  });
}

function abort() {
  router.push({ name: 'ProjectSelection' });
  emit('abort');
}
</script>

<template>
  <form class="flex flex-column gap-2 w-23rem" @submit.prevent="createProject">
    <span class="p-float-label">
      <InputText
          id="value"
          v-model="projectTitle"
          type="text"
          :class="{ 'p-invalid': errorMessage }"
          aria-describedby="text-error"
      />
      <label for="value">Projekttitel</label>
    </span>
    <small id="text-error" class="p-error">
      {{ errorMessage || '&nbsp;' }}
    </small>
    <Button type="submit" label="Erstellen" icon="pi pi-plus" iconPos="left"/>
    <Button type="reset" label="Abbrechen" icon="pi pi-times" iconPos="left" @click="abort"/>
  </form>
</template>
