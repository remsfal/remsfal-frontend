<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { projectService } from '@/services/ProjectService';
import { useProjectStore } from '@/stores/ProjectStore';

const props = defineProps<{
  projectId: string;
}>();

const { t } = useI18n();
const toast = useToast();
const projectStore = useProjectStore();

const projectName = ref('');
const originalProjectName = ref('');
const loading = ref(false);

const fetchProject = async (id: string) => {
  try {
    const project = await projectService.getProject(id);
    projectName.value = project.title;
    originalProjectName.value = project.title;
  } catch (error) {
    console.error('Error fetching project:', error);
  }
};

const canSave = computed(
  () =>
    projectName.value.trim() !== originalProjectName.value.trim() &&
    projectName.value.trim() !== '',
);

const saveProjectName = async () => {
  if (!canSave.value) return;

  loading.value = true;
  try {
    await projectService.updateProject(props.projectId, { title: projectName.value.trim() });
    originalProjectName.value = projectName.value.trim();
    projectStore.updateProjectName(props.projectId, projectName.value.trim());

    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('projectSettings.saveSuccess'),
      life: 3000,
    });
  } catch (error) {
    console.error('Error saving project name:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('projectSettings.saveError'),
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchProject(props.projectId));

watch(
  () => props.projectId,
  (newProjectId) => {
    fetchProject(newProjectId);
  },
);

watch(
  () => projectStore.selectedProject,
  (newProject) => {
    if (newProject && newProject.id === props.projectId) {
      projectName.value = newProject.name;
      originalProjectName.value = newProject.name;
    }
  },
  { immediate: true },
);
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full">
    <template #title>
      <div class="font-semibold text-xl">
        Liegenschaftseinstellungen
      </div>
    </template>

    <template #content>
      <div class="flex flex-col gap-3">
        <label for="name" class="font-medium text-gray-700">Name der Liegenschaft</label>
        <div class="flex gap-2 items-center">
          <InputText
            id="name"
            v-model="projectName"
            type="text"
            class="flex-1"
            :placeholder="t('projectSettings.propertyNamePlaceholder')"
          />
          <Button
            :label="t('button.save')"
            icon="pi pi-save"
            :disabled="!canSave || loading"
            :loading="loading"
            @click="saveProjectName"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
:deep(.p-inputtext) {
  border-radius: 0.5rem;
}
</style>
