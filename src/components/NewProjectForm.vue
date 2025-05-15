<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { projectService } from '@/services/ProjectService';
import { useProjectStore } from '@/stores/ProjectStore';
import { useRouter } from 'vue-router';
import { saveProject } from '@/helper/indexeddb';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  abort: [];
}>();

const { t } = useI18n();

const maxLength = 100;
const projectTitle = ref('');
const errorMessage = ref('');

const router = useRouter();

watch(projectTitle, (newProjectTitle) => {
  if (newProjectTitle.length > maxLength) {
    errorMessage.value = t('newProjectForm.title.error', { maxLength: maxLength });
  } else {
    errorMessage.value = '';
  }
});

async function createProject() {
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
    projectStore.searchSelectedProject(newProject.id);

    await router.push({
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
  <form class="flex flex-col gap-2 w-[34rem]" @submit.prevent="createProject">
    <span class="p-float-label">
      <InputText
        id="value"
        v-model="projectTitle"
        type="text"
        :class="{ 'p-invalid': errorMessage }"
        aria-describedby="text-error"
      />
      <label for="value">{{ t('newProjectForm.input.name') }}</label>
    </span>
    <small id="text-error" class="p-error">
      {{ errorMessage || '&nbsp;' }}
    </small>
    <div class="flex justify-end gap-2">
    <Button
    type="reset"
    :label="t('button.cancel')"
    icon="pi pi-times"
    iconPos="left"
    severity="secondary"
    @click="abort"
    />
    <Button
    type="submit"
    :label="t('button.create')"
    icon="pi pi-plus"
    iconPos="left"
    />
    </div>

  </form>
</template>
