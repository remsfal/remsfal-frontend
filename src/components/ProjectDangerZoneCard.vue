<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { projectService } from '@/services/ProjectService.ts';
import { useProjectStore } from '@/stores/ProjectStore.ts';
import DangerZoneCard from '@/components/common/DangerZoneCard.vue';

const props = defineProps<{
  projectId: string;
}>();

const { t } = useI18n();
const toast = useToast();
const projectStore = useProjectStore();
const router = useRouter();

const deleteProject = async () => {
  try {
    await projectService.deleteProject(props.projectId);
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('projectSettings.deleteSuccess'),
      life: 3000,
    });
    await projectStore.refreshProjectList();
    await router.push('/projects');
  } catch (err) {
    console.error('Error deleting project:', err);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('projectSettings.deleteError'),
      life: 6000,
    });
  }
};
</script>

<template>
  <DangerZoneCard
    :description="t('projectSettings.dangerZone.description')"
    :deleteButtonLabel="t('projectSettings.dangerZone.deleteButton')"
    :confirmTitle="t('projectSettings.dangerZone.confirmTitle')"
    :confirmMessage="t('projectSettings.dangerZone.confirmMessage')"
    @confirm="deleteProject"
  />
</template>
