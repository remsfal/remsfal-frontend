<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import Select from 'primevue/select';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useOrganizationStore } from '@/stores/OrganizationStore';
import ProjectMemberRoleSelect from '@/components/projectMembership/ProjectMemberRoleSelect.vue';
import { type MemberRole } from '@/services/ProjectMemberService';
import { projectOrganizationService } from '@/services/ProjectOrganizationService';
import BaseDialog from '@/components/common/BaseDialog.vue';
import DialogFormField from '@/components/common/DialogFormField.vue';

const props = defineProps<{ projectId: string }>();
const emit = defineEmits<(e: 'newOrganization', organizationName: string) => void>();

const { t } = useI18n();
const toast = useToast();
const organizationStore = useOrganizationStore();

const visible = ref(false);

const validationSchema = z.object({
  organizationId: z
    .string()
    .min(1, { message: t('projectSettings.newProjectOrganizationButton.invalidOrganization') }),
  role: z
    .string()
    .min(1, { message: t('projectSettings.newProjectOrganizationButton.invalidRole') }),
});

const resolver = zodResolver(validationSchema);

const initialValues = ref({ organizationId: '', role: '' });

function resetForm() {
  initialValues.value = { organizationId: '', role: '' };
}

const onSubmit = (event: FormSubmitEvent) => {
  const formState = event.states;
  const organizationId = formState.organizationId?.value || '';
  const role = formState.role?.value || '';

  if (!event.valid || !organizationId || !role) {
    return;
  }

  addOrganization(organizationId, role as MemberRole);
};

const addOrganization = async (organizationId: string, role: MemberRole) => {
  visible.value = false;

  const org = organizationStore.userOrganizations.find((o) => o.id === organizationId);
  const organizationName = org?.name ?? organizationId;

  try {
    await projectOrganizationService.addOrganization(props.projectId, { organizationId, role });
    emit('newOrganization', organizationName);
    resetForm();
  } catch (error: any) {
    console.error('Failed to add organization:', error?.message ?? error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('projectSettings.newProjectOrganizationButton.errorAdd'),
      life: 5000,
    });
  }
};

function formError(field: { invalid?: boolean; touched?: boolean; error?: { message?: string } } | undefined) {
  return field?.invalid && field?.touched ? field.error?.message : undefined;
}

onMounted(async () => {
  if (!organizationStore.initialized) {
    await organizationStore.fetchUserOrganization();
  }
});
</script>

<template>
  <Button
    :label="t('projectSettings.newProjectOrganizationButton.label')"
    icon="pi pi-plus"
    style="width: auto"
    @click="visible = true"
  />

  <BaseDialog
    v-model:visible="visible"
    :header="t('projectSettings.newProjectOrganizationButton.label')"
    @hide="resetForm"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-6">
        <DialogFormField
          inputId="organizationId"
          :label="t('projectSettings.newProjectOrganizationButton.organizationLabel')"
          required
          :errorMessage="formError($form.organizationId)"
        >
          <Select
            id="organizationId"
            name="organizationId"
            :options="organizationStore.userOrganizations"
            optionLabel="name"
            optionValue="id"
            :placeholder="t('projectSettings.newProjectOrganizationButton.organizationPlaceholder')"
            :class="{ 'p-invalid': $form.organizationId?.invalid && $form.organizationId?.touched }"
            fluid
          />
        </DialogFormField>

        <DialogFormField
          inputId="role"
          :label="t('projectSettings.newProjectOrganizationButton.roleLabel')"
          required
          :errorMessage="$form.role?.invalid && $form.role?.touched ? $form.role.error.message : undefined"
        >
          <ProjectMemberRoleSelect
            name="role"
            :invalid="$form.role?.invalid && $form.role?.touched"
            class="w-full"
          />
        </DialogFormField>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button type="button" :label="t('button.cancel')" severity="secondary" @click="visible = false" />
        <Button
          type="submit"
          :label="t('button.add')"
          icon="pi pi-plus"
          :disabled="!$form.organizationId?.valid || !$form.role?.valid || (!$form.organizationId?.dirty && !$form.role?.dirty)"
        />
      </div>
    </Form>
  </BaseDialog>
</template>
