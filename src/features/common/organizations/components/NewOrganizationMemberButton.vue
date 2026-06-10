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
import EmployeeRoleSelect from '@/features/common/organizations/components/EmployeeRoleSelect.vue';
import { type OrganizationEmployeeJson, type EmployeeRole, organizationService } from '@/services/OrganizationService';
import BaseDialog from '@/components/common/BaseDialog.vue';
import DialogFormField from '@/components/common/DialogFormField.vue';

const props = defineProps<{ organizationId: string }>();
const emit = defineEmits<(e: 'newMember', email: string) => void>();

const { t } = useI18n();
const toast = useToast();

const visible = ref(false);

const validationSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: t('organization.newMemberButton.invalidEmail') }),
  employeeRole: z
    .string()
    .min(1, { message: t('organization.newMemberButton.invalidRole') }),
});

const resolver = zodResolver(validationSchema);
const initialValues = ref({ email: '', employeeRole: '' });

function resetForm() {
  initialValues.value = { email: '', employeeRole: '' };
}

const onSubmit = (event: FormSubmitEvent) => {
  const formState = event.states;
  const email = formState.email?.value?.trim() || '';
  const employeeRole = formState.employeeRole?.value || '';

  if (!event.valid || !email || !employeeRole) {
    return;
  }

  addMember(email, employeeRole as EmployeeRole);
};

const addMember = async (email: string, employeeRole: EmployeeRole) => {
  visible.value = false;

  const member: OrganizationEmployeeJson = {
    email,
    employeeRole,
  };

  try {
    await organizationService.addEmployee(props.organizationId, member);
    emit('newMember', email);
    resetForm();
  } catch (error) {
    console.error('Failed to add member:', error instanceof Error ? error.message : error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('organization.newMemberButton.errorAdd'),
      life: 5000,
    });
  }
};
</script>

<template>
  <Button
    :label="t('organization.newMemberButton.label')"
    icon="pi pi-plus"
    style="width: auto"
    @click="visible = true"
  />

  <BaseDialog
    v-model:visible="visible"
    :header="t('organization.newMemberButton.label')"
    @hide="resetForm"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-6">
        <DialogFormField
          inputId="email"
          :label="t('organization.newMemberButton.emailLabel')"
          required
          :errorMessage="$form.email?.invalid && $form.email?.touched ? $form.email.error.message : undefined"
        >
          <InputText
            id="email"
            name="email"
            type="email"
            :placeholder="t('organization.newMemberButton.emailPlaceholder')"
            :class="{ 'p-invalid': $form.email?.invalid && $form.email?.touched }"
            autocomplete="off"
            autofocus
            fluid
          />
        </DialogFormField>

        <DialogFormField
          inputId="employeeRole"
          :label="t('organization.newMemberButton.roleLabel')"
          required
          :errorMessage="$form.employeeRole?.invalid && $form.employeeRole?.touched
            ? $form.employeeRole.error.message : undefined"
        >
          <EmployeeRoleSelect
            name="employeeRole"
            :invalid="$form.employeeRole?.invalid && $form.employeeRole?.touched"
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
          :disabled="!$form.email?.valid || !$form.employeeRole?.valid || (!$form.email?.dirty && !$form.employeeRole?.dirty)"
        />
      </div>
    </Form>
  </BaseDialog>
</template>
