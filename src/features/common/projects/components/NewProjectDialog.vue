<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import { Form, type FormSubmitEvent } from '@primevue/forms';
import BaseDialog from '@/components/BaseDialog.vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { projectService } from '@/features/common/projects/services/ProjectService';
import { useProjectStore } from '@/features/common/projects/stores/ProjectStore';
import { useOrganizationStore } from '@/features/common/organizations';
import { useRouter } from 'vue-router';
import { useAppToast } from '@/composables/useAppToast';
import { saveProject } from '@/helper/indexeddb';

const visible = defineModel<boolean>('visible', { default: false });

// Value of the owner option "myself": the project is created for the current user
const PERSONAL_OWNER = 'personal';

const { t } = useI18n();
const appToast = useAppToast();

const router = useRouter();
const projectStore = useProjectStore();
const organizationStore = useOrganizationStore();

// Only owners and managers of an organization may create a property for it
const eligibleOrganizations = computed(() => {
  const organizations = new Map<string, string>();
  for (const { organizationId, organizationName, employeeRole } of organizationStore.userEmployments) {
    if (organizationId && (employeeRole === 'OWNER' || employeeRole === 'MANAGER')) {
      organizations.set(organizationId, organizationName ?? organizationId);
    }
  }
  return [...organizations].map(([value, label]) => ({ value, label }));
});

const ownerOptions = computed(() => [
  { value: PERSONAL_OWNER, label: t('newProjectForm.input.owner.self') },
  ...eligibleOrganizations.value,
]);

const showOwnerSelect = computed(() => eligibleOrganizations.value.length > 0);

const validationSchema = z.object({
  projectTitle: z
    .string()
    .trim()
    .min(3, { error: () => t('newProjectForm.title.required') })
    .max(100, { error: () => t('newProjectForm.title.error', { maxLength: 100 }) }),
  owner: z.string().min(1),
});

const resolver = zodResolver(validationSchema);

const initialValues = ref({ projectTitle: '', owner: PERSONAL_OWNER });

const onSubmit = async (event: FormSubmitEvent) => {
  const formState = event.states;
  const projectTitle = formState.projectTitle?.value?.trim() || '';
  const owner = formState.owner?.value;

  if (!event.valid || !projectTitle) {
    return;
  }

  const managingOrganizationId = owner && owner !== PERSONAL_OWNER ? owner : undefined;
  await createProject(projectTitle, managingOrganizationId);
};

async function saveOffline(title: string, managingOrganizationId?: string) {
  await saveProject(title, managingOrganizationId);
  appToast.warn(t('newProjectForm.offlineSaved'), { summary: t('success.savedOffline') });
  visible.value = false;
}

async function createProject(title: string, managingOrganizationId?: string) {
  try {
    if (!navigator.onLine) {
      await saveOffline(title, managingOrganizationId);
      return;
    }

    const newProject = await projectService.createProject(title, managingOrganizationId);

    if (!newProject.id) {
      await saveOffline(title, managingOrganizationId);
      return;
    }

    // Reload the list to get the effective role, which may be derived from the organization
    await projectStore.refreshProjectList();
    const projectItem = projectStore.projectList.find((p) => p.id === newProject.id) ?? {
      id: newProject.id,
      name: newProject.title,
      memberRole: managingOrganizationId ? ('MANAGER' as const) : ('PROPRIETOR' as const),
    };
    await projectStore.addProjectToList(projectItem);
    projectStore.setSelectedProject(projectItem);

    await router.push({ name: 'ProjectDashboard', params: { projectId: newProject.id } });

    appToast.success(t('newProjectForm.successCreated'), { summary: t('success.created') });
    visible.value = false;
  } catch (error) {
    console.error('Failed to create project online:', error);
    await saveOffline(title, managingOrganizationId);
  }
}

function abort() {
  visible.value = false;
}

onMounted(async () => {
  if (!organizationStore.initialized) {
    await organizationStore.fetchUserOrganization();
  }
});
</script>

<template>
  <BaseDialog
    v-model:visible="visible"
    :header="t('projectSelection.add')"
    closable
    @hide="abort"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <label for="projectTitle" class="font-semibold">{{ t('newProjectForm.input.name') }}</label>
          <InputText
            id="projectTitle"
            name="projectTitle"
            type="text"
            :placeholder="t('newProjectForm.input.exampleAddress')"
            :class="{ 'p-invalid': $form.projectTitle?.invalid && $form.projectTitle?.touched }"
            autofocus
            fluid
          />
          <Message
            v-if="$form.projectTitle?.invalid && $form.projectTitle?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.projectTitle?.error?.message }}
          </Message>
        </div>

        <div v-if="showOwnerSelect" class="flex flex-col gap-1">
          <label for="projectOwner" class="font-semibold">{{ t('newProjectForm.input.owner.label') }}</label>
          <Select
            inputId="projectOwner"
            name="owner"
            :options="ownerOptions"
            optionLabel="label"
            optionValue="value"
            aria-describedby="projectOwnerHint"
            fluid
          />
          <small id="projectOwnerHint" class="text-muted-color">{{ t('newProjectForm.input.owner.hint') }}</small>
        </div>
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
