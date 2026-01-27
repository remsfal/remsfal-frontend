<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from "primevue/message";
import { Form } from '@primevue/forms';
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

function abort() {
  router.push({ name: 'ProjectSelection' });
  emit('update:visible', false);
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="t('projectSelection.add')"
    class="w-full max-w-md sm:max-w-lg md:max-w-xl"
    closable
    @update:visible="emit('update:visible', $event)"
    @hide="abort"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-4">
        <label for="projectTitle" class="font-semibold">
          {{ t('newProjectForm.input.name') }}
        </label>

        <InputText
          name="projectTitle"
          type="text"
          :placeholder="t('newProjectForm.input.exampleAddress')"
          :class="{ 'p-invalid': $form.projectTitle?.invalid && $form.projectTitle?.touched }"
          autofocus
          fluid
        />
        <Message v-if="$form.projectTitle?.invalid" severity="error" size="small" variant="simple">
          {{ $form.projectTitle.error.message }}
        </Message>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <Button type="button" :label="t('button.cancel')" severity="secondary" @click="abort" />
        <Button
          type="submit"
          :label="t('button.create')"
          icon="pi pi-plus"
          :disabled="!$form.projectTitle?.valid || !$form.projectTitle?.dirty"
        />
      </div>
    </Form>
  </Dialog>
</template>

<style scoped>

</style>
