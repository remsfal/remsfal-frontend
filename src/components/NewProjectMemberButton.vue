<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import ProjectMemberRoleSelect from '@/components/ProjectMemberRoleSelect.vue';
import { type ProjectMemberJson, type MemberRole, projectMemberService } from '@/services/ProjectMemberService';

const props = defineProps<{ projectId: string }>();
const emit = defineEmits<(e: 'newMember', email: string) => void>();

const { t } = useI18n();

const visible = ref(false);

// Zod validation schema
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

// Reset form state
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
    const err = error as { response?: { data: unknown }; message: string };
    console.error('Failed to add member:', err.response?.data || err.message);
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

  <Dialog
    v-model:visible="visible"
    modal
    :header="t('projectSettings.newProjectMemberButton.label')"
    :style="{ width: '35rem' }"
    @hide="resetForm"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-1 mb-6">
        <div class="flex items-center gap-6">
          <label for="email" class="font-semibold w-24">{{
            t('projectSettings.newProjectMemberButton.emailLabel')
          }}</label>
          <InputText
            id="email"
            name="email"
            type="email"
            :placeholder="t('projectSettings.newProjectMemberButton.emailPlaceholder')"
            class="flex-auto"
            :class="{ 'p-invalid': $form.email?.invalid && $form.email?.touched }"
            autocomplete="off"
            autofocus
            fluid
          />
        </div>
        <Message
          v-if="$form.email?.invalid && $form.email?.touched" severity="error"
          size="small" variant="simple"
          class="ml-28"
        >
          {{ $form.email.error.message }}
        </Message>
      </div>

      <div class="flex flex-col gap-1 mb-2">
        <div class="flex items-center gap-6">
          <label for="role" class="font-semibold w-24">{{ t('projectSettings.newProjectMemberButton.roleLabel') }}</label>
          <ProjectMemberRoleSelect
            name="role"
            :invalid="$form.role?.invalid && $form.role?.touched"
            class="w-full"
          />
        </div>
        <Message
          v-if="$form.role?.invalid && $form.role?.touched" severity="error"
          size="small" variant="simple"
          class="ml-28"
        >
          {{ $form.role.error.message }}
        </Message>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button type="button" :label="t('button.cancel')" severity="secondary" @click="visible = false" />
        <Button
          type="submit"
          :label="t('button.add')"
          :disabled="!$form.email?.valid || !$form.role?.valid || (!$form.email?.dirty && !$form.role?.dirty)"
        />
      </div>
    </Form>
  </Dialog>
</template>
