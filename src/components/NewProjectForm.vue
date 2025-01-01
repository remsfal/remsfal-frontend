<script setup lang="ts">
import { defineEmits, ref, watch } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import ProjectService, { type ProjectItem } from '@/services/ProjectService';
import { useProjectStore } from '@/stores/ProjectStore';
import { useRouter } from 'vue-router';
import { saveProject } from '@/helper/indexeddb';


const emit = defineEmits<{
  abort: [];
}>();

const maxLength = 100;
const projectTitle = ref('');
const errorMessage = ref('');

const router = useRouter();

watch(projectTitle, (newProjectTitle) => {
  if (newProjectTitle.length > maxLength) {
    errorMessage.value = `Der Name der Liegenschaft darf nicht mehr als ${maxLength} Zeichen lang sein`;
  } else {
    errorMessage.value = '';
  }
});

async function createProject() {
  const projectService = new ProjectService();
  const projectStore = useProjectStore();

  if (projectTitle.value.length > maxLength) return;

  const projectTitleValue = projectTitle.value;

  // Check if the app is offline
  if (!navigator.onLine) {
    // Offline: Save the project in IndexedDB
    await saveProject(projectTitleValue);
    return; // End the function here
  }

  // Online: Send the project directly to the backend
  try {
    const newProject = await projectService.createProject(projectTitleValue);

    // Update the project store
    const newProjectItem: ProjectItem = {
      id: newProject.id,
      name: newProject.title,
      memberRole: 'MANAGER',
    };

    projectStore.searchSelectedProject(newProjectItem);

    router.push({
      name: 'ProjectDashboard',
      params: { projectId: newProject.id },
    });
  } catch (error) {
    console.error('Failed to create project online. Saving offline:', error);

    // Optional: Save the title locally in case of an error
    await saveProject(projectTitleValue);
  }
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
      <label for="value">Name der Liegenschaft</label>
    </span>
    <small id="text-error" class="p-error">
      {{ errorMessage || '&nbsp;' }}
    </small>
    <Button type="submit" label="Erstellen" icon="pi pi-plus" iconPos="left"/>
    <Button type="reset" label="Abbrechen" icon="pi pi-times" iconPos="left" @click="abort"/>
  </form>
</template>
