<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import EmployeeRoleSelect from '@/features/common/organizations/components/EmployeeRoleSelect.vue';
import { type OrganizationEmployeeJson, type EmployeeRole, organizationService } from '@/services/OrganizationService';
import BaseDialog from '@/components/common/BaseDialog.vue';

const props = defineProps<{ organizationId: string }>();
const emit = defineEmits<(e: 'newEmployee', email: string) => void>();

const { t } = useI18n();
const toast = useToast();

const visible = ref(false);

const validationSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: t('organization.newEmployeeButton.invalidEmail') }),
  employeeRole: z
    .string()
    .min(1, { message: t('organization.newEmployeeButton.invalidRole') }),
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

  addEmployee(email, employeeRole as EmployeeRole);
};

const addEmployee = async (email: string, employeeRole: EmployeeRole) => {
  visible.value = false;

  const employee: OrganizationEmployeeJson = {
    email,
    employeeRole,
  };

  try {
    await organizationService.addEmployee(props.organizationId, employee);
    emit('newEmployee', email);
    resetForm();
  } catch (error) {
    console.error('Failed to add employee:', error instanceof Error ? error.message : error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('organization.newEmployeeButton.errorAdd'),
      life: 5000,
    });
  }
};
</script>

<template>
  <Button
    :label="t('organization.newEmployeeButton.label')"
    icon="pi pi-plus"
    style="width: auto"
    @click="visible = true"
  />

  <BaseDialog
    v-model:visible="visible"
    :header="t('organization.newEmployeeButton.label')"
    @hide="resetForm"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <label for="email" class="font-semibold">
            {{ t('organization.newEmployeeButton.emailLabel') }}<span aria-hidden="true"> *</span>
          </label>
          <InputText
            id="email"
            name="email"
            type="email"
            :placeholder="t('organization.newEmployeeButton.emailPlaceholder')"
            :class="{ 'p-invalid': $form.email?.invalid && $form.email?.touched }"
            autocomplete="off"
            autofocus
            fluid
          />
          <Message
            v-if="$form.email?.invalid && $form.email?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.email?.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <label for="employeeRole" class="font-semibold">
            {{ t('organization.newEmployeeButton.roleLabel') }}<span aria-hidden="true"> *</span>
          </label>
          <EmployeeRoleSelect
            name="employeeRole"
            inputId="employeeRole"
            :invalid="$form.employeeRole?.invalid && $form.employeeRole?.touched"
            class="w-full"
          />
          <Message
            v-if="$form.employeeRole?.invalid && $form.employeeRole?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.employeeRole?.error?.message }}
          </Message>
        </div>
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
