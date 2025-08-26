<script lang="ts" setup>
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import ProjectMemberSettings from '@/components/ProjectMemberSettings.vue';
import { ref, onMounted, watch } from 'vue';
import { projectService } from '@/services/ProjectService';

const props = defineProps<{
  projectId: string
}>();

const projectName = ref('');

const fetchProject = async (id: string) => {
  try {
    const project = await projectService.getProject(id);
    projectName.value = project.title;
  }
  catch (error) {
    console.error('Error fetching project:', error);
  }
};

onMounted(() => {
  fetchProject(props.projectId);
});

// Watch for changes in projectId and update the project data
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
      <div class="font-semibold text-xl">
        Liegenschaftseinstellungen
      </div>
    </template>
    <template #content>
      <div class="flex flex-col gap-2">
        <label for="name">Name der Liegenschaft</label>
        <InputText
          id="name"
          v-model="projectName"
          type="text"
        />
      </div>
    </template>
  </Card>

  <ProjectMemberSettings :project-id="props.projectId" />
</template>

<style scoped></style>
