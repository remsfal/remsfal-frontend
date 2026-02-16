<script lang="ts" setup>
import BaseCard from '@/components/common/BaseCard.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ProjectSettings from '@/components/ProjectSettings.vue';
import ProjectMemberSettings from '@/components/ProjectMemberSettings.vue';
import { ref } from 'vue';
import { projectService } from '@/services/ProjectService.ts';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useProjectStore } from '@/stores/ProjectStore.ts';
import { useRouter } from 'vue-router';

const props = defineProps<{
  projectId: string;
}>();

const { t } = useI18n();
const toast = useToast();
const projectStore = useProjectStore();
const router = useRouter();

const showDeleteDialog = ref(false);

const deleteProject = async () => {
  try {
    await projectService.deleteProject(props.projectId);
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('projectSettings.deleteSuccess'),
      life: 3000,
    });
    showDeleteDialog.value = false;
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
  <ProjectSettings :projectId="props.projectId" />

  <ProjectMemberSettings :projectId="props.projectId" />

  <!-- Danger Zone Card -->
  <BaseCard titleClass="text-red-600 font-semibold text-xl">
    <template #title>
      {{ t('projectSettings.dangerZone.title') }}
    </template>
    <template #content>
      <div class="flex flex-col gap-4">
        <p class="text-gray-700">
          {{ t('projectSettings.dangerZone.description') }}
        </p>
        <div>
          <Button
            severity="danger"
            :label="t('projectSettings.dangerZone.deleteButton')"
            icon="pi pi-trash"
            @click="showDeleteDialog = true"
          />
        </div>
      </div>
    </template>
  </BaseCard>

  <!-- Delete Confirmation Dialog -->
  <Dialog
    v-model:visible="showDeleteDialog"
    :header="t('projectSettings.dangerZone.confirmTitle')"
    :modal="true"
    :style="{ width: '30rem' }"
  >
    <p class="mb-4">
      {{ t('projectSettings.dangerZone.confirmMessage') }}
    </p>
    <template #footer>
      <Button
        :label="t('button.cancel')"
        severity="secondary"
        @click="showDeleteDialog = false"
      />
      <Button
        :label="t('projectSettings.dangerZone.confirmDeleteButton')"
        severity="danger"
        icon="pi pi-trash"
        @click="deleteProject"
      />
    </template>
  </Dialog>
</template>

<style scoped></style>
