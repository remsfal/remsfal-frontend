<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import ProjectMemberRoleSelect from '@/components/projectMembership/ProjectMemberRoleSelect.vue';
import { type ProjectMemberJson, type MemberRole, projectMemberService } from '@/services/ProjectMemberService';
import BaseDialog from '@/components/common/BaseDialog.vue';
import DialogFormField from '@/components/common/DialogFormField.vue';

const props = defineProps<{ projectId: string }>();
const emit = defineEmits<(e: 'newMember', email: string) => void>();

const { t } = useI18n();
const toast = useToast();

const visible = ref(false);

const validationSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: t('projectSettings.newProjectMemberButton.invalidEmail') }),
  role: z
    .string()
    .min(1, { message: t('projectSettings.newProjectMemberButton.invalidRole') }),
});

const resolver = zodResolver(validationSchema);

const initialValues = ref({ email: '', role: '' });

function resetForm() {
  initialValues.value = { email: '', role: '' };
}

const onSubmit = (event: FormSubmitEvent) => {
  const formState = event.states;
  const email = formState.email?.value?.trim() || '';
  const role = formState.role?.value || '';

  if (!event.valid || !email || !role) {
    return;
  }

  addMember(email, role as MemberRole);
};

const addMember = async (email: string, role: MemberRole) => {
  visible.value = false;

  const member: ProjectMemberJson = {
    email,
    role,
  };

  try {
    await projectMemberService.addMember(props.projectId, member);
    emit('newMember', email);
    resetForm();
  } catch (error) {
    console.error('Failed to add member:', error instanceof Error ? error.message : error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('projectSettings.newProjectMemberButton.errorAdd'),
      life: 5000,
    });
  }
};
</script>

<template>
  <Button
    :label="t('projectSettings.newProjectMemberButton.label')"
    icon="pi pi-plus"
    style="width: auto"
    @click="visible = true"
  />

  <BaseDialog
    v-model:visible="visible"
    :header="t('projectSettings.newProjectMemberButton.label')"
    @hide="resetForm"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-6">
        <DialogFormField
          inputId="email"
          :label="t('projectSettings.newProjectMemberButton.emailLabel')"
          required
          :errorMessage="$form.email?.invalid && $form.email?.touched ? $form.email.error.message : undefined"
        >
          <InputText
            id="email"
            name="email"
            type="email"
            :placeholder="t('projectSettings.newProjectMemberButton.emailPlaceholder')"
            :class="{ 'p-invalid': $form.email?.invalid && $form.email?.touched }"
            autocomplete="off"
            autofocus
            fluid
          />
        </DialogFormField>

        <DialogFormField
          inputId="role"
          :label="t('projectSettings.newProjectMemberButton.roleLabel')"
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
          :disabled="!$form.email?.valid || !$form.role?.valid || (!$form.email?.dirty && !$form.role?.dirty)"
        />
      </div>
    </Form>
  </BaseDialog>
</template>
