<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppToast } from '@/composables/useAppToast';
import BaseCard from '@/components/BaseCard.vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { projectService } from '@/services/ProjectService';
import { useProjectStore } from '@/stores/ProjectStore';

const props = defineProps<{
  projectId: string;
}>();

const { t } = useI18n();
const appToast = useAppToast();
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

    appToast.success(t('projectSettings.saveSuccess'), { summary: t('success.saved') });
  } catch (error) {
    console.error('Error saving project name:', error);
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
  <BaseCard>
    <template #title>
      {{ t('projectSettings.title') }}
    </template>

    <template #content>
      <div class="flex flex-col gap-3">
        <label for="name" class="font-medium text-gray-700">{{ t('projectSettings.propertyNamePlaceholder') }}</label>
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
  </BaseCard>
</template>

<style scoped>
:deep(.p-inputtext) {
  border-radius: 0.5rem;
}
</style>
