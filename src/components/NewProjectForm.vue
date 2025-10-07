<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { projectService } from '@/services/ProjectService';
import { useProjectStore } from '@/stores/ProjectStore';
import { useRouter } from 'vue-router';
import { saveProject } from '@/helper/indexeddb';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{ abort: [] }>();
const { t } = useI18n();

const maxLength = 100;
const projectTitle = ref('');
const errorMessage = ref('');

const router = useRouter();

watch(projectTitle, (newProjectTitle) => {
  errorMessage.value =
    newProjectTitle.length > maxLength
      ? t('newProjectForm.title.error', { maxLength })
      : '';
});

async function createProject() {
  const projectStore = useProjectStore();

  if (projectTitle.value.length > maxLength) return;

  const projectTitleValue = projectTitle.value.trim();
  if (!projectTitleValue) {
    errorMessage.value = t('newProjectForm.title.required');
    return;
  }

  if (!navigator.onLine) {
    await saveProject(projectTitleValue);
    return;
  }

  try {
    const newProject = await projectService.createProject(projectTitleValue);
    if (!newProject.id) {
      console.error('Created project has no ID.');
      await saveProject(projectTitleValue);
      return;
    }
    projectStore.searchSelectedProject(newProject.id);
    await router.push({ name: 'ProjectDashboard', params: { projectId: newProject.id } });
  } catch (error) {
    console.error('Failed to create project online. Saving offline:', error);
    await saveProject(projectTitleValue);
  }
}

function abort() {
  router.push({ name: 'ProjectSelection' });
  emit('abort');
}
</script>

<template>
  <form
    class="flex flex-col gap-5 w-full max-w-md p-8 bg-white rounded-2xl shadow-md border border-gray-100"
    @submit.prevent="createProject"
  >
    <div class="flex flex-col gap-1">
      <label for="value" class="text-gray-700 font-medium text-sm">
        {{ t('newProjectForm.input.name') }}
      </label>
      <InputText
        id="value"
        v-model="projectTitle"
        type="text"
        :class="{ 'p-invalid': errorMessage }"
        aria-describedby="text-error"
        class="w-full"
        placeholder="z. B. Musterstraße 12, Berlin"
      />
      <small id="text-error" class="p-error text-xs h-4">
        {{ errorMessage || ' ' }}
      </small>
    </div>

    <div class="flex justify-end gap-3 mt-4">
      <Button
        type="reset"
        :label="t('button.cancel')"
        icon="pi pi-times"
        severity="secondary"
        @click="abort"
      />
      <Button
        type="submit"
        :label="t('button.create')"
        icon="pi pi-plus"
      />
    </div>
  </form>
</template>

<style scoped>
:deep(.p-inputtext) {
  border-radius: 0.5rem;
}
</style>
