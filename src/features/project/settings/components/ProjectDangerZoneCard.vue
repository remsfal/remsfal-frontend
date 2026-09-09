<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useAppToast } from '@/composables/useAppToast';
import { useRouter } from 'vue-router';
import { projectService } from '@/services/ProjectService';
import { useProjectStore } from '@/stores/ProjectStore';
import DangerZoneCard from '@/components/DangerZoneCard.vue';

const props = defineProps<{
  projectId: string;
}>();

const { t } = useI18n();
const appToast = useAppToast();
const projectStore = useProjectStore();
const router = useRouter();

const deleteProject = async () => {
  try {
    await projectService.deleteProject(props.projectId);
    appToast.success(t('projectSettings.deleteSuccess'), { summary: t('success.saved') });
    await projectStore.refreshProjectList();
    await router.push('/projects');
  } catch (err) {
    console.error('Error deleting project:', err);
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
