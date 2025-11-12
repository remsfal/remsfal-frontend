<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { projectService } from '@/services/ProjectService';
import { useProjectStore } from '@/stores/ProjectStore';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { saveProject } from '@/helper/indexeddb';

const emit = defineEmits<{ abort: [] }>();
const { t } = useI18n();
const toast = useToast();

const visible = ref(true);
const maxLength = 100;
const projectTitle = ref('');
const errorMessage = ref('');

const router = useRouter();
const projectStore = useProjectStore();

watch(projectTitle, (newTitle) => {
  errorMessage.value =
    newTitle.length > maxLength
      ? t('newProjectForm.title.error', { maxLength })
      : '';
});

async function createProject(event?: Event) {
  if (event) {
    event.preventDefault();
  }

  if (projectTitle.value.length > maxLength) return;

  const title = projectTitle.value.trim();
  if (!title) {
    errorMessage.value = t('newProjectForm.title.required');
    return;
  }

  try {
    if (!navigator.onLine) {
      await saveProject(title);
      toast.add({
        severity: 'warn',
        summary: t('success.savedOffline'),
        detail: t('newProjectForm.offlineSaved'),
        life: 4000,
      });
      visible.value = false;
      return;
    }

    const newProject = await projectService.createProject(title);
    if (!newProject.id) {
      await saveProject(title);
      toast.add({
        severity: 'warn',
        summary: t('success.savedOffline'),
        detail: t('newProjectForm.offlineSaved'),
        life: 4000,
      });
      visible.value = false;
      return;
    }

    // Convert the new project to ProjectItem format and add it to the store
    const projectItem = {
      id: newProject.id,
      name: newProject.title,
      memberRole: 'MANAGER' as const // Default role for project creator
    };
    await projectStore.addProjectToList(projectItem);
    projectStore.setSelectedProject(projectItem);
    
    await router.push({ name: 'ProjectDashboard', params: { projectId: newProject.id } });

    toast.add({
      severity: 'success',
      summary: t('success.created'),
      detail: t('newProjectForm.successCreated'),
      life: 4000,
    });
    visible.value = false;
  } catch (error) {
    console.error('Failed to create project online:', error);
    await saveProject(title);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('newProjectForm.offlineSaved'),
      life: 4000,
    });
    visible.value = false;
  }
}

function abort() {
  router.push({ name: 'ProjectSelection' });
  emit('abort');
  visible.value = false;
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="t('newProjectForm.input.name')"
    :style="{ width: '35rem' }"
    :closable="true"
    @hide="abort"
  >
    <form @submit.prevent="createProject">
      <div class="flex flex-col gap-4">
        <label for="projectTitle" class="font-semibold">
          {{ t('newProjectForm.input.name') }}
        </label>

        <InputText
          id="projectTitle"
          v-model="projectTitle"
          type="text"
          :placeholder="t('newProjectForm.input.exampleAddress')"
          :class="{ 'p-invalid': errorMessage }"
        />
        <small class="p-error text-xs h-4">{{ errorMessage || ' ' }}</small>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <Button type="button" :label="t('button.cancel')" severity="secondary" @click="abort" />
        <Button type="submit" :label="t('button.create')" icon="pi pi-plus" @click="createProject" />
      </div>
    </form>
  </Dialog>
</template>

<style scoped>
:deep(.p-inputtext) {
  border-radius: 0.5rem;
}
</style>
