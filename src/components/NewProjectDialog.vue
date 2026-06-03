<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { Form } from '@primevue/forms';
import BaseDialog from '@/components/common/BaseDialog.vue';
import DialogFormField from '@/components/common/DialogFormField.vue';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { projectService } from '@/services/ProjectService';
import { useProjectStore } from '@/stores/ProjectStore';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { saveProject } from '@/helper/indexeddb';

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const { t } = useI18n();
const toast = useToast();

const router = useRouter();
const projectStore = useProjectStore();

// Zod validation schema
const validationSchema = z.object({
  projectTitle: z
    .string()
    .trim()
    .min(3, { message: t('newProjectForm.title.required') })
    .max(100, { message: t('newProjectForm.title.error', { maxLength: 100 }) })
});

const resolver = zodResolver(validationSchema);

const initialValues = ref({projectTitle: ''});

const onSubmit = (event: FormSubmitEvent) => {
  const formState = event.states;
  const projectTitle = formState.projectTitle?.value?.trim() || '';

  if (!event.valid || !projectTitle) {
    return;
  }

  createProject(projectTitle);
};

async function createProject(title: string) {
  try {
    if (!navigator.onLine) {
      await saveProject(title);
      toast.add({
        severity: 'warn',
        summary: t('success.savedOffline'),
        detail: t('newProjectForm.offlineSaved'),
        life: 4000,
      });
      emit('update:visible', false);
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
      emit('update:visible', false);
      return;
    }

    const projectItem = {
      id: newProject.id,
      name: newProject.title,
      memberRole: 'MANAGER' as const
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
    emit('update:visible', false);
  } catch (error) {
    console.error('Failed to create project online:', error);
    await saveProject(title);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('newProjectForm.offlineSaved'),
      life: 4000,
    });
    emit('update:visible', false);
  }
}

function formError(field: { invalid?: boolean; touched?: boolean; error?: { message?: string } } | undefined) {
  return field?.invalid && field?.touched ? field.error?.message : undefined;
}

function abort() {
  router.push({ name: 'ProjectSelection' });
  emit('update:visible', false);
}
</script>

<template>
  <BaseDialog
    :visible="visible"
    :header="t('projectSelection.add')"
    closable
    @update:visible="emit('update:visible', $event)"
    @hide="abort"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-6">
        <DialogFormField
          inputId="projectTitle"
          :label="t('newProjectForm.input.name')"
          :errorMessage="formError($form.projectTitle)"
        >
          <InputText
            id="projectTitle"
            name="projectTitle"
            type="text"
            :placeholder="t('newProjectForm.input.exampleAddress')"
            :class="{ 'p-invalid': $form.projectTitle?.invalid && $form.projectTitle?.touched }"
            autofocus
            fluid
          />
        </DialogFormField>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button type="button" :label="t('button.cancel')" severity="secondary" @click="abort" />
        <Button
          type="submit"
          :label="t('button.create')"
          icon="pi pi-plus"
          :disabled="!$form.projectTitle?.valid || !$form.projectTitle?.dirty"
        />
      </div>
    </Form>
  </BaseDialog>
</template>

<style scoped>

</style>
