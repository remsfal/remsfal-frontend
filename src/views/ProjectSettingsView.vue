<script lang="ts" setup>
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import ProjectMemberSettings from '@/components/ProjectMemberSettings.vue';
import { ref, onMounted, watch, computed } from 'vue';
import { projectService } from '@/services/ProjectService';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps<{
  projectId: string;
}>();

// State
const projectName = ref('');
const originalProjectName = ref('');
const loading = ref(false);

const toast = useToast();

// Fetch project data
const fetchProject = async (id: string) => {
  try {
    const project = await projectService.getProject(id);
    projectName.value = project.title;
    originalProjectName.value = project.title;
  } catch (error) {
    console.error('Error fetching project:', error);
  }
};

// Computed: button is enabled only if name changed
const canSave = computed(
  () =>
    projectName.value.trim() !== originalProjectName.value.trim() &&
    projectName.value.trim() !== '',
);

// Save project name
const saveProjectName = async () => {
  if (!canSave.value) return;

  loading.value = true;
  try {
    await projectService.updateProject(props.projectId, { title: projectName.value.trim() });
    originalProjectName.value = projectName.value.trim();
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

// Initial load
onMounted(() => fetchProject(props.projectId));

// Watch for projectId changes
watch(
  () => props.projectId,
  (newProjectId) => {
    fetchProject(newProjectId);
  },
);
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full">
    <template #title>
      <div class="font-semibold text-xl">Liegenschaftseinstellungen</div>
    </template>

    <template #content>
      <div class="flex flex-col gap-3">
        <label for="name" class="font-medium text-gray-700">Name der Liegenschaft</label>

        <div class="flex gap-2 items-center">
          <InputText
            id="name"
            type="text"
            v-model="projectName"
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

  <ProjectMemberSettings :projectId="props.projectId" />
</template>

<style scoped>
:deep(.p-inputtext) {
  border-radius: 0.5rem;
}
</style>
